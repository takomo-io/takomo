import { mock } from "jest-mock-extended"
import {
  CloudFormationStack,
  StackName,
  StackStatus,
} from "../../../../src/aws/cloudformation/model"
import { Region } from "../../../../src/aws/common/model"
import {
  buildStacksUndeployPlan,
  StacksUndeployPlan,
  StackUndeployOperationType,
} from "../../../../src/command/stacks/undeploy/plan"
import { InternalStack, StackPath } from "../../../../src/stacks/stack"
import { ROOT_STACK_GROUP_PATH } from "../../../../src/takomo-stacks-model/constants"

interface CreateStackProps {
  readonly name: StackName
  readonly path: StackPath
  readonly region: Region
  readonly obsolete?: boolean
  readonly status?: StackStatus
  readonly dependents?: ReadonlyArray<StackPath>
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
  dependents = [],
}: CreateStackProps): InternalStack => {
  const getCurrentCloudFormationStack = async (): Promise<
    CloudFormationStack | undefined
  > => {
    if (!status) {
      return undefined
    }

    return mock<CloudFormationStack>({ status })
  }

  const s = mock<InternalStack>({
    name,
    path,
    region,
    dependents,
    obsolete,
    getCurrentCloudFormationStack,
  })

  allStacks.push(s)
  if (!status) {
    pendingStacks.push(s)
  }

  return s
}

interface ExpectedOperation {
  readonly path: StackPath
  readonly type: StackUndeployOperationType
}

const assertPlan = (
  plan: StacksUndeployPlan,
  ...expectedOperations: ReadonlyArray<ExpectedOperation>
): void => {
  const actualOperations = plan.operations.map(({ type, stack }) => ({
    type,
    path: stack.path,
  }))
  expect(actualOperations).toStrictEqual(expectedOperations)
}

describe("#buildStacksUndeployPlan", () => {
  test("empty plan", async () => {
    const plan = await buildStacksUndeployPlan(
      [],
      ROOT_STACK_GROUP_PATH,
      false,
      false,
    )
    assertPlan(plan)
  })

  test("single non-existing stack", async () => {
    const plan = await buildStacksUndeployPlan(
      [stack({ name: "a", path: "/a.yml/eu-north-1", region: "eu-north-1" })],
      ROOT_STACK_GROUP_PATH,
      false,
      false,
    )
    assertPlan(plan, { type: "SKIP", path: "/a.yml/eu-north-1" })
  })

  test("single existing stack", async () => {
    const plan = await buildStacksUndeployPlan(
      [
        stack({
          name: "a",
          path: "/a.yml/eu-north-1",
          region: "eu-north-1",
          status: "CREATE_COMPLETE",
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      false,
    )
    assertPlan(plan, { type: "DELETE", path: "/a.yml/eu-north-1" })
  })

  test("two existing stacks", async () => {
    const plan = await buildStacksUndeployPlan(
      [
        stack({
          name: "a",
          path: "/a.yml/eu-north-1",
          region: "eu-north-1",
          status: "CREATE_COMPLETE",
        }),
        stack({
          name: "b",
          path: "/b.yml/eu-north-1",
          region: "eu-north-1",
          status: "UPDATE_COMPLETE",
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      false,
    )
    assertPlan(
      plan,
      { type: "DELETE", path: "/a.yml/eu-north-1" },
      { type: "DELETE", path: "/b.yml/eu-north-1" },
    )
  })

  test("two existing stacks with dependents", async () => {
    const plan = await buildStacksUndeployPlan(
      [
        stack({
          name: "a",
          path: "/a.yml/eu-north-1",
          region: "eu-north-1",
          status: "CREATE_COMPLETE",
          dependents: ["/b.yml/eu-north-1"],
        }),
        stack({
          name: "b",
          path: "/b.yml/eu-north-1",
          region: "eu-north-1",
          status: "UPDATE_COMPLETE",
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      false,
    )
    assertPlan(
      plan,
      { type: "DELETE", path: "/b.yml/eu-north-1" },
      { type: "DELETE", path: "/a.yml/eu-north-1" },
    )
  })

  test("an obsolete stack that depends on another stack", async () => {
    const plan = await buildStacksUndeployPlan(
      [
        stack({
          name: "a",
          path: "/a.yml/eu-north-1",
          region: "eu-north-1",
          status: "CREATE_COMPLETE",
          dependents: ["/b.yml/eu-north-1"],
        }),
        stack({
          name: "b",
          path: "/b.yml/eu-north-1",
          region: "eu-north-1",
          status: "UPDATE_COMPLETE",
          obsolete: true,
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      false,
    )
    assertPlan(plan, { type: "DELETE", path: "/a.yml/eu-north-1" })
  })

  test("two obsolete stacks with dependents", async () => {
    const plan = await buildStacksUndeployPlan(
      [
        stack({
          name: "a",
          path: "/a.yml/eu-north-1",
          region: "eu-north-1",
          status: "CREATE_COMPLETE",
          dependents: ["/b.yml/eu-north-1"],
          obsolete: true,
        }),
        stack({
          name: "b",
          path: "/b.yml/eu-north-1",
          region: "eu-north-1",
          status: "UPDATE_COMPLETE",
          obsolete: true,
        }),
      ],
      ROOT_STACK_GROUP_PATH,
      false,
      false,
    )
    assertPlan(plan)
  })
})
