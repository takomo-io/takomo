import { mock } from "jest-mock-extended"
import { CloudFormationClient } from "../../../../src/takomo-aws-clients"
import {
  DetailedCloudFormationStackSummary,
  Region,
  StackName,
  StackStatus,
} from "../../../../src/takomo-aws-model"
import {
  buildStacksDeployPlan,
  StacksDeployPlan,
} from "../../../../src/takomo-stacks-commands/stacks/deploy/plan"
import {
  InternalStack,
  ROOT_STACK_GROUP_PATH,
  StackOperationType,
  StackPath,
} from "../../../../src/takomo-stacks-model"
import { createConsoleLogger } from "../../../../src/takomo-util"

interface CreateStackProps {
  readonly name: StackName
  readonly path: StackPath
  readonly region: Region
  readonly obsolete?: boolean
  readonly status?: StackStatus
  readonly dependencies?: ReadonlyArray<StackPath>
}

let allStacks = new Array<InternalStack>()
let pendingStacks = new Array<InternalStack>()

beforeEach(() => {
  allStacks = new Array<InternalStack>()
  pendingStacks = new Array<InternalStack>()
})

const stack = ({
  name,
  path,
  region,
  status,
  obsolete = false,
  dependencies = [],
}: CreateStackProps): InternalStack => {
  const listNotDeletedStacks = async (
    stackNames?: ReadonlyArray<StackName>,
  ): Promise<Map<StackName, DetailedCloudFormationStackSummary>> => {
    const regionStacks = allStacks
      .filter(({ region: stackRegion }) => region === stackRegion)
      .filter(
        (s) =>
          !pendingStacks.some(
            (p) => p.path === s.path && p.region === s.region,
          ),
      )
      .filter(
        ({ name: stackName }) => !stackNames || stackNames.includes(stackName),
      )

    return new Map(
      regionStacks.map(({ name }) => [
        name,
        mock<DetailedCloudFormationStackSummary>({ status }),
      ]),
    )
  }

  const cfClient = mock<CloudFormationClient>({ listNotDeletedStacks })

  const s = mock<InternalStack>({ name, path, region, dependencies, obsolete })
  s.getCloudFormationClient.mockReturnValue(Promise.resolve(cfClient))
  s.getCredentials.mockReturnValue(
    Promise.resolve({ accessKeyId: "", secretAccessKey: "", sessionToken: "" }),
  )

  allStacks.push(s)
  if (!status) {
    pendingStacks.push(s)
  }

  return s
}

const logger = createConsoleLogger({ logLevel: "warn" })

interface ExpectedOperation {
  readonly path: StackPath
  readonly type: StackOperationType
}

const assertPlan = (
  plan: StacksDeployPlan,
  ...expectedOperations: ReadonlyArray<ExpectedOperation>
): void => {
  const actualOperations = plan.operations.map(({ type, stack }) => ({
    type,
    path: stack.path,
  }))
  expect(actualOperations).toStrictEqual(expectedOperations)
}

describe("#buildStacksDeployPlan", () => {
  test("single existing stack", async () => {
    const plan = await buildStacksDeployPlan(
      [
        stack({
          name: "one",
          region: "eu-west-1",
          path: "/one.yml/eu-west-1",
          status: "CREATE_COMPLETE",
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      logger,
    )

    assertPlan(plan, { type: "UPDATE", path: "/one.yml/eu-west-1" })
  })

  test("single non-existing stack", async () => {
    const plan = await buildStacksDeployPlan(
      [
        stack({
          name: "two",
          region: "eu-central-1",
          path: "/two.yml/eu-central-1",
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      logger,
    )

    assertPlan(plan, { type: "CREATE", path: "/two.yml/eu-central-1" })
  })

  test("failed stack", async () => {
    const plan = await buildStacksDeployPlan(
      [
        stack({
          name: "two",
          region: "eu-central-1",
          path: "/two.yml/eu-central-1",
          status: "CREATE_FAILED",
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      logger,
    )

    assertPlan(plan, { type: "RECREATE", path: "/two.yml/eu-central-1" })
  })

  test("stacks from two regions", async () => {
    const plan = await buildStacksDeployPlan(
      [
        stack({
          name: "two",
          region: "eu-central-1",
          path: "/two.yml/eu-central-1",
          status: "CREATE_COMPLETE",
        }),
        stack({
          name: "one",
          region: "eu-north-1",
          path: "/one.yml/eu-north-1",
          status: "CREATE_COMPLETE",
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      logger,
    )

    assertPlan(
      plan,
      { type: "UPDATE", path: "/one.yml/eu-north-1" },
      { type: "UPDATE", path: "/two.yml/eu-central-1" },
    )
  })

  test("stacks with dependencies", async () => {
    const plan = await buildStacksDeployPlan(
      [
        stack({
          name: "three",
          region: "eu-north-1",
          path: "/three.yml/eu-north-1",
          status: "CREATE_COMPLETE",
          dependencies: ["/one.yml/eu-north-1"],
        }),
        stack({
          name: "two",
          region: "eu-north-1",
          path: "/two.yml/eu-north-1",
          status: "CREATE_COMPLETE",
        }),
        stack({
          name: "one",
          region: "eu-north-1",
          path: "/one.yml/eu-north-1",
          status: "CREATE_COMPLETE",
          dependencies: ["/two.yml/eu-north-1"],
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      logger,
    )

    assertPlan(
      plan,
      { type: "UPDATE", path: "/two.yml/eu-north-1" },
      { type: "UPDATE", path: "/one.yml/eu-north-1" },
      { type: "UPDATE", path: "/three.yml/eu-north-1" },
    )
  })

  test("single obsolete stack", async () => {
    const plan = await buildStacksDeployPlan(
      [
        stack({
          name: "two",
          region: "eu-central-1",
          path: "/two.yml/eu-central-1",
          status: "CREATE_COMPLETE",
          obsolete: true,
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      logger,
    )

    expect(plan.operations).toHaveLength(0)
  })

  test("multiple obsolete stacks", async () => {
    const plan = await buildStacksDeployPlan(
      [
        stack({
          name: "two",
          region: "eu-central-1",
          path: "/two.yml/eu-central-1",
          status: "CREATE_COMPLETE",
          obsolete: true,
        }),
        stack({
          name: "one",
          region: "eu-central-1",
          path: "/one.yml/eu-central-1",
          status: "CREATE_COMPLETE",
          obsolete: true,
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      logger,
    )

    expect(plan.operations).toHaveLength(0)
  })

  test("multiple obsolete stacks with dependencies", async () => {
    const plan = await buildStacksDeployPlan(
      [
        stack({
          name: "two",
          region: "eu-central-1",
          path: "/two.yml/eu-central-1",
          status: "CREATE_COMPLETE",
          obsolete: true,
          dependencies: ["/one.yml/eu-central-1"],
        }),
        stack({
          name: "one",
          region: "eu-central-1",
          path: "/one.yml/eu-central-1",
          status: "CREATE_COMPLETE",
          obsolete: true,
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      logger,
    )

    expect(plan.operations).toHaveLength(0)
  })

  test("an obsolete stack with dependencies", async () => {
    const plan = await buildStacksDeployPlan(
      [
        stack({
          name: "two",
          region: "eu-central-1",
          path: "/two.yml/eu-central-1",
          status: "CREATE_COMPLETE",
          dependencies: ["/one.yml/eu-central-1"],
          obsolete: true,
        }),
        stack({
          name: "one",
          region: "eu-central-1",
          path: "/one.yml/eu-central-1",
          status: "CREATE_COMPLETE",
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      logger,
    )

    assertPlan(plan, { type: "UPDATE", path: "/one.yml/eu-central-1" })
  })
})
