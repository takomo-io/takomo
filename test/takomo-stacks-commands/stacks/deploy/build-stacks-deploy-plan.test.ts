import { mock } from "jest-mock-extended"
import { CloudFormationClient } from "../../../../src/aws/cloudformation/client.js"
import {
  DetailedCloudFormationStackSummary,
  StackName,
  StackStatus,
} from "../../../../src/aws/cloudformation/model.js"
import { Region } from "../../../../src/aws/common/model.js"
import { StackOperationType } from "../../../../src/command/command-model.js"
import {
  buildStacksDeployPlan,
  StacksDeployPlan,
} from "../../../../src/command/stacks/deploy/plan.js"
import { StackPath } from "../../../../src/stacks/stack.js"
import { ROOT_STACK_GROUP_PATH } from "../../../../src/takomo-stacks-model/constants.js"
import {
  InternalStandardStack,
  STANDARD_STACK_TYPE,
} from "../../../../src/stacks/standard-stack.js"
import { createCustomStackHandlerRegistry } from "../../../../src/custom-stack-handler/custom-stack-handler-registry.js"
import { logger } from "../../../logger.js"

interface CreateStackProps {
  readonly name: StackName
  readonly path: StackPath
  readonly region: Region
  readonly obsolete?: boolean
  readonly status?: StackStatus
  readonly dependencies?: ReadonlyArray<StackPath>
}

let allStacks = new Array<InternalStandardStack>()
let pendingStacks = new Array<InternalStandardStack>()

beforeEach(() => {
  allStacks = new Array<InternalStandardStack>()
  pendingStacks = new Array<InternalStandardStack>()
})

const stack = ({
  name,
  path,
  region,
  status,
  obsolete = false,
  dependencies = [],
}: CreateStackProps): InternalStandardStack => {
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

  const s = mock<InternalStandardStack>({
    name,
    path,
    region,
    dependencies,
    obsolete,
    type: STANDARD_STACK_TYPE,
  })

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

const customStackHandlerRegistry = createCustomStackHandlerRegistry({ logger })

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
      customStackHandlerRegistry,
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
      customStackHandlerRegistry,
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
      customStackHandlerRegistry,
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
      customStackHandlerRegistry,
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
      customStackHandlerRegistry,
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
      customStackHandlerRegistry,
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
      customStackHandlerRegistry,
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
      customStackHandlerRegistry,
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
      customStackHandlerRegistry,
    )

    assertPlan(plan, { type: "UPDATE", path: "/one.yml/eu-central-1" })
  })
})
