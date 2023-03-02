import { mock } from "jest-mock-extended"
import dedent from "ts-dedent"
import { CloudFormationStack } from "../../../../src/aws/cloudformation/model.js"
import {
  CONFIRM_DEPLOY_ANSWER_CANCEL,
  CONFIRM_DEPLOY_ANSWER_CONTINUE_AND_REVIEW,
  CONFIRM_DEPLOY_ANSWER_CONTINUE_NO_REVIEW,
  createDeployStacksIO,
  UserActions,
} from "../../../../src/cli-io.js"
import { StackOperationType } from "../../../../src/command/command-model.js"
import { StackDeployOperation } from "../../../../src/command/stacks/deploy/plan.js"
import {
  bold,
  cyan,
  green,
  orange,
  red,
  yellow,
} from "../../../../src/utils/colors.js"
import { formatTimestamp } from "../../../../src/utils/date.js"
import {
  createConsoleLogger,
  LogWriter,
} from "../../../../src/utils/logging.js"
import { createCapturingLogWriter } from "../../../capturing-log-writer.js"
import { mockInternalStack, MockInternalStackProps } from "../../mocks.js"

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
            last change:               -
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
    const now = new Date()
    const creationTime = new Date(now.getTime() - 1000 * 60 * 60 * 12)

    const operation = mockOperation("UPDATE", {
      name: "hello",
      path: "/hello.yml/eu-north-1",
      region: "eu-north-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
        creationTime,
        lastUpdatedTime: creationTime,
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
            last change:               ${formatTimestamp(
              creationTime,
            )}      (12h ago)
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
    const now = new Date()
    const creationTime = new Date(now.getTime() - 1000 * 60 * 60 * 3)

    const operation = mockOperation("RECREATE", {
      name: "rds",
      path: "/rds.yml/eu-west-1",
      region: "eu-west-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_FAILED",
        creationTime,
        lastUpdatedTime: creationTime,
      }),
    })

    const output = await confirmDeploy(operation)
    const expected = dedent`
      
      ${bold("Review stacks deployment plan:")}
      ${bold("------------------------------")}
      A stacks deployment plan has been created and is shown below.
      Stacks will be deployed in the order they are listed, and in parallel when possible.
      
      Following stacks will be deployed:
      
        ${orange("± /rds.yml/eu-west-1:          (stack will be replaced)")}
            name:                      rds
            status:                    ${red("CREATE_FAILED")}
            last change:               ${formatTimestamp(
              creationTime,
            )}      (3h ago)
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
    const now = new Date()
    const creationTime = new Date(now.getTime() - 1000 * 60 * 60 * 3)

    const operation1 = mockOperation("UPDATE", {
      name: "hello",
      path: "/hello.yml/eu-north-1",
      region: "eu-north-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
        creationTime,
        lastUpdatedTime: creationTime,
      }),
    })

    const operation2 = mockOperation("UPDATE", {
      name: "hello2",
      path: "/hello2.yml/eu-central-1",
      region: "eu-central-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
        creationTime,
        lastUpdatedTime: creationTime,
      }),
      dependencies: ["/hello.yml/eu-north-1"],
    })

    const operation3 = mockOperation("UPDATE", {
      name: "hello3",
      path: "/hello3.yml/eu-central-1",
      region: "eu-central-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
        creationTime,
        lastUpdatedTime: creationTime,
      }),
    })

    const operation4 = mockOperation("UPDATE", {
      name: "hello4",
      path: "/hello4.yml/eu-central-1",
      region: "eu-central-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
        creationTime,
        lastUpdatedTime: creationTime,
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
            last change:               ${formatTimestamp(
              creationTime,
            )}      (3h ago)
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
            last change:               ${formatTimestamp(
              creationTime,
            )}      (3h ago)
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
            last change:               ${formatTimestamp(
              creationTime,
            )}      (3h ago)
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
            last change:               ${formatTimestamp(
              creationTime,
            )}      (3h ago)
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
