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

  test("dependencies are shown correctly", async () => {
    const operation1 = mockOperation("UPDATE", {
      name: "hello",
      path: "/hello.yml/eu-north-1",
      region: "eu-north-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
      }),
    })

    const operation2 = mockOperation("UPDATE", {
      name: "hello2",
      path: "/hello2.yml/eu-central-1",
      region: "eu-central-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
      }),
      dependencies: ["/hello.yml/eu-north-1"],
    })

    const operation3 = mockOperation("UPDATE", {
      name: "hello3",
      path: "/hello3.yml/eu-central-1",
      region: "eu-central-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
      }),
    })

    const operation4 = mockOperation("UPDATE", {
      name: "hello4",
      path: "/hello4.yml/eu-central-1",
      region: "eu-central-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
      }),
      dependencies: ["/hello3.yml/eu-central-1", "/hello2.yml/eu-central-1"],
    })

    const output = await confirmDeploy(
      operation1,
      operation3,
      operation2,
      operation4,
    )
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

        ${yellow("~ /hello3.yml/eu-central-1:    (stack will be updated)")}
            name:                      hello3
            status:                    ${green("CREATE_COMPLETE")}
            account id:                123456789012
            region:                    eu-central-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependencies:              none

        ${yellow("~ /hello2.yml/eu-central-1:    (stack will be updated)")}
            name:                      hello2
            status:                    ${green("CREATE_COMPLETE")}
            account id:                123456789012
            region:                    eu-central-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependencies:
              - /hello.yml/eu-north-1

        ${yellow("~ /hello4.yml/eu-central-1:    (stack will be updated)")}
            name:                      hello4
            status:                    ${green("CREATE_COMPLETE")}
            account id:                123456789012
            region:                    eu-central-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependencies:
              - /hello3.yml/eu-central-1
              - /hello2.yml/eu-central-1

        stacks | total: 4, ${yellow("update: 4")}

      `
    expect(output).toBe(expected)
  })
})
