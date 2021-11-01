import { CloudFormationStack } from "@takomo/aws-model"
import { StackDeployOperation } from "@takomo/stacks-commands"
import { StackOperationType } from "@takomo/stacks-model"
import { createCapturingLogWriter } from "@takomo/test-unit"
import {
  bold,
  createConsoleLogger,
  cyan,
  green,
  LogWriter,
  orange,
  red,
  yellow,
} from "@takomo/util"
import { mock } from "jest-mock-extended"
import dedent from "ts-dedent"
import { createDeployStacksIO } from "../../../src"
import {
  CONFIRM_DEPLOY_ANSWER_CANCEL,
  CONFIRM_DEPLOY_ANSWER_CONTINUE_AND_REVIEW,
  CONFIRM_DEPLOY_ANSWER_CONTINUE_NO_REVIEW,
} from "../../../src/stacks/deploy-stacks/deploy-stacks-io"
import { UserActions } from "../../../src/user-actions"
import { mockInternalStack, MockInternalStackProps } from "../../mocks"

const actions = mock<UserActions>()

actions.choose
  .calledWith(
    "How do you want to continue?",
    [
      CONFIRM_DEPLOY_ANSWER_CANCEL,
      CONFIRM_DEPLOY_ANSWER_CONTINUE_AND_REVIEW,
      CONFIRM_DEPLOY_ANSWER_CONTINUE_NO_REVIEW,
    ],
    true,
  )
  .mockResolvedValue(true)

const createIO = (writer: LogWriter) =>
  createDeployStacksIO({
    actions,
    writer,
    logger: createConsoleLogger({ logLevel: "info" }),
  })

const mockOperation = (
  type: StackOperationType,
  stackProps: MockInternalStackProps,
): StackDeployOperation => {
  const { currentStack } = stackProps
  return {
    type,
    currentStack,
    stack: mockInternalStack(stackProps),
  }
}

const confirmDeploy = (
  ...operations: ReadonlyArray<StackDeployOperation>
): Promise<string> => {
  const output = { value: "" }
  return createIO(createCapturingLogWriter(output))
    .confirmDeploy({ operations })
    .then(() => output.value)
}

describe("DeployStacksIO#confirmDeploy", () => {
  test("a single create operation", async () => {
    const operation = mockOperation("CREATE", {
      name: "example",
      path: "/example.yml/eu-west-1",
      region: "eu-west-1",
    })

    const output = await confirmDeploy(operation)
    const expected = dedent`
      
      ${bold("Review stacks deployment plan:")}
      ${bold("------------------------------")}
      A stacks deployment plan has been created and is shown below.
      Stacks will be deployed in the order they are listed, and in parallel when possible.
      
      Following stacks will be deployed:
      
        ${green("+ /example.yml/eu-west-1:      (stack will be created)")}
            name:                      example
            status:                    ${cyan("PENDING")}
            account id:                123456789012
            region:                    eu-west-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependencies:              none

    `
    expect(output).toBe(expected)
  })

  test("a single update operation", async () => {
    const operation = mockOperation("UPDATE", {
      name: "hello",
      path: "/hello.yml/eu-north-1",
      region: "eu-north-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
      }),
    })

    const output = await confirmDeploy(operation)
    const expected = dedent`
      
      ${bold("Review stacks deployment plan:")}
      ${bold("------------------------------")}
      A stacks deployment plan has been created and is shown below.
      Stacks will be deployed in the order they are listed, and in parallel when possible.
      
      Following stacks will be deployed:
      
        ${yellow("~ /hello.yml/eu-north-1:       (stack will be updated)")}
            name:                      hello
            status:                    ${green("CREATE_COMPLETE")}
            account id:                123456789012
            region:                    eu-north-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependencies:              none

    `
    expect(output).toBe(expected)
  })

  test("a single recreate operation", async () => {
    const operation = mockOperation("RECREATE", {
      name: "rds",
      path: "/rds.yml/eu-west-1",
      region: "eu-west-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_FAILED",
      }),
    })

    const output = await confirmDeploy(operation)
    const expected = dedent`
      
      ${bold("Review stacks deployment plan:")}
      ${bold("------------------------------")}
      A stacks deployment plan has been created and is shown below.
      Stacks will be deployed in the order they are listed, and in parallel when possible.
      
      Following stacks will be deployed:
      
        ${orange("± /rds.yml/eu-west-1:          (stack will replaced)")}
            name:                      rds
            status:                    ${red("CREATE_FAILED")}
            account id:                123456789012
            region:                    eu-west-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependencies:              none

    `
    expect(output).toBe(expected)
  })
})
