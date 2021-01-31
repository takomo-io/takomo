import { CloudFormationStack } from "@takomo/aws-model"
import {
  StackUndeployOperation,
  StackUndeployOperationType,
} from "@takomo/stacks-commands"
import { createCapturingLogWriter } from "@takomo/test-unit"
import {
  bold,
  createConsoleLogger,
  cyan,
  green,
  grey,
  LogWriter,
  red,
} from "@takomo/util"
import { mock } from "jest-mock-extended"
import dedent from "ts-dedent"
import { createUndeployStacksIO } from "../../../src"
import {
  CONFIRM_UNDEPLOY_ANSWER_CANCEL,
  CONFIRM_UNDEPLOY_ANSWER_CONTINUE,
} from "../../../src/stacks/undeploy-stacks-io"
import { UserActions } from "../../../src/user-actions"
import { mockInternalStack, MockInternalStackProps } from "../../mocks"

const actions = mock<UserActions>()

actions.choose
  .calledWith(
    "How do you want to continue?",
    [CONFIRM_UNDEPLOY_ANSWER_CANCEL, CONFIRM_UNDEPLOY_ANSWER_CONTINUE],
    true,
  )
  .mockResolvedValue(true)

const createIO = (writer: LogWriter) =>
  createUndeployStacksIO({
    actions,
    writer,
    logger: createConsoleLogger({ logLevel: "info" }),
  })

const mockOperation = (
  type: StackUndeployOperationType,
  stackProps: MockInternalStackProps,
): StackUndeployOperation => {
  const { currentStack } = stackProps
  return {
    type,
    currentStack,
    stack: mockInternalStack(stackProps),
  }
}

const confirmUndeploy = (
  ...operations: ReadonlyArray<StackUndeployOperation>
): Promise<string> => {
  const output = { value: "" }
  return createIO(createCapturingLogWriter(output))
    .confirmUndeploy({ operations })
    .then(() => output.value)
}

describe("UndeployStacksIO#confirmUndeploy", () => {
  test("a single delete operation", async () => {
    const operation = mockOperation("DELETE", {
      name: "example",
      path: "/example.yml/eu-west-1",
      region: "eu-west-1",
    })

    const output = await confirmUndeploy(operation)
    const expected = dedent`
      
      ${bold("Review stacks undeployment plan:")}
      ${bold("--------------------------------")}
      A stacks undeployment plan has been created and is shown below.
      Stacks will be undeployed in the order they are listed, and in parallel when possible.
      
      Following stacks will be undeployed:
      
        ${red("- /example.yml/eu-west-1:      (stack will be removed)")}
            name:                      example
            status:                    ${cyan("PENDING")}
            account id:                123456789012
            region:                    eu-west-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependents:                none

        stacks | total: 1, ${red("remove: 1")}
      
    `
    expect(output).toBe(expected)
  })

  test("a single skip operation", async () => {
    const operation = mockOperation("SKIP", {
      name: "hello",
      path: "/hello.yml/eu-north-1",
      region: "eu-north-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
      }),
    })

    const output = await confirmUndeploy(operation)
    const expected = dedent`
      
      ${bold("Review stacks undeployment plan:")}
      ${bold("--------------------------------")}
      A stacks undeployment plan has been created and is shown below.
      Stacks will be undeployed in the order they are listed, and in parallel when possible.
      
      Following stacks will be undeployed:
      
        ${grey(
          "* /hello.yml/eu-north-1:       (stack not found and will be skipped)",
        )}
            name:                      hello
            status:                    ${green("CREATE_COMPLETE")}
            account id:                123456789012
            region:                    eu-north-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependents:                none

        stacks | total: 1, ${grey("skip: 1")}
      
    `
    expect(output).toBe(expected)
  })

  test("skip and delete operations", async () => {
    const operation1 = mockOperation("SKIP", {
      name: "hello",
      path: "/hello.yml/eu-north-1",
      region: "eu-north-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
      }),
    })

    const operation2 = mockOperation("DELETE", {
      name: "kitty",
      path: "/kitty.yml/eu-west-1",
      region: "eu-west-1",
      currentStack: mock<CloudFormationStack>({
        status: "UPDATE_COMPLETE",
      }),
    })

    const output = await confirmUndeploy(operation1, operation2)
    const expected = dedent`
      
      ${bold("Review stacks undeployment plan:")}
      ${bold("--------------------------------")}
      A stacks undeployment plan has been created and is shown below.
      Stacks will be undeployed in the order they are listed, and in parallel when possible.
      
      Following stacks will be undeployed:
      
        ${grey(
          "* /hello.yml/eu-north-1:       (stack not found and will be skipped)",
        )}
            name:                      hello
            status:                    ${green("CREATE_COMPLETE")}
            account id:                123456789012
            region:                    eu-north-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependents:                none
      
        ${red("- /kitty.yml/eu-west-1:        (stack will be removed)")}
            name:                      kitty
            status:                    ${green("UPDATE_COMPLETE")}
            account id:                123456789012
            region:                    eu-west-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependents:                none
      
        stacks | total: 2, ${red("remove: 1")}, ${grey("skip: 1")}
      
    `
    expect(output).toBe(expected)
  })
})
