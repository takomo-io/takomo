import { mock } from "jest-mock-extended"
import { dedent } from "ts-dedent"
import { CloudFormationStack } from "../../../../src/aws/cloudformation/model.js"
import { createUndeployStacksIO } from "../../../../src/cli-io/stacks/undeploy-stacks-io.js"
import {
  CONFIRM_UNDEPLOY_ANSWER_CANCEL,
  CONFIRM_UNDEPLOY_ANSWER_CONTINUE,
} from "../../../../src/cli-io/stacks/undeploy-stacks-io.js"
import {
  StackUndeployOperation,
  StackUndeployOperationType,
} from "../../../../src/command/stacks/undeploy/plan.js"
import { bold, cyan, green, grey, red } from "../../../../src/utils/colors.js"
import { formatTimestamp } from "../../../../src/utils/date.js"
import {
  createConsoleLogger,
  LogWriter,
} from "../../../../src/utils/logging.js"
import { createCapturingLogWriter } from "../../../capturing-log-writer.js"
import { mockInternalStack, MockInternalStackProps } from "../../mocks.js"
import { UserActions } from "../../../../src/cli-io/user-actions.js"

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
    dependents: stackProps.dependents ?? [],
    stack: mockInternalStack(stackProps),
  }
}

const confirmUndeploy = (
  ...operations: ReadonlyArray<StackUndeployOperation>
): Promise<string> => {
  const output = { value: "" }
  return createIO(createCapturingLogWriter(output))
    .confirmUndeploy({ operations, prune: false })
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
      Stacks will be undeployed in the order they are listed, and in
      parallel when possible.
      
      Following stacks will be undeployed:
      
        ${red("- /example.yml/eu-west-1:      (stack will be removed)")}
            name:                      example
            status:                    ${cyan("PENDING")}
            last change:               -
            account id:                123456789012
            region:                    eu-west-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependents:                none

    `
    expect(output).toBe(expected)
  })

  test("a single skip operation", async () => {
    const now = new Date()
    const creationTime = new Date(now.getTime() - 1000 * 60 * 60 * 24)

    const operation = mockOperation("SKIP", {
      name: "hello",
      path: "/hello.yml/eu-north-1",
      region: "eu-north-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
        creationTime,
        lastUpdatedTime: creationTime,
      }),
    })

    const output = await confirmUndeploy(operation)
    const expected = dedent`
      
      ${bold("Review stacks undeployment plan:")}
      ${bold("--------------------------------")}
      A stacks undeployment plan has been created and is shown below.
      Stacks will be undeployed in the order they are listed, and in
      parallel when possible.
      
      Following stacks will be undeployed:
      
        ${grey(
          "* /hello.yml/eu-north-1:       (stack not found and will be skipped)",
        )}
            name:                      hello
            status:                    ${green("CREATE_COMPLETE")}
            last change:               ${formatTimestamp(
              creationTime,
            )}      (1d ago)
            account id:                123456789012
            region:                    eu-north-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependents:                none

    `
    expect(output).toBe(expected)
  })

  test("skip and delete operations", async () => {
    const now = new Date()
    const creationTime = new Date(now.getTime() - 1000 * 60 * 60 * 24)
    const creationTime2 = new Date(now.getTime() - 1000 * 60 * 60 * 36)

    const operation1 = mockOperation("SKIP", {
      name: "hello",
      path: "/hello.yml/eu-north-1",
      region: "eu-north-1",
      currentStack: mock<CloudFormationStack>({
        status: "CREATE_COMPLETE",
        creationTime,
        lastUpdatedTime: creationTime,
      }),
    })

    const operation2 = mockOperation("DELETE", {
      name: "kitty",
      path: "/kitty.yml/eu-west-1",
      region: "eu-west-1",
      currentStack: mock<CloudFormationStack>({
        status: "UPDATE_COMPLETE",
        creationTime: creationTime,
        lastUpdatedTime: creationTime2,
      }),
    })

    const output = await confirmUndeploy(operation1, operation2)
    const expected = dedent`
      
      ${bold("Review stacks undeployment plan:")}
      ${bold("--------------------------------")}
      A stacks undeployment plan has been created and is shown below.
      Stacks will be undeployed in the order they are listed, and in
      parallel when possible.
      
      Following stacks will be undeployed:
      
        ${grey(
          "* /hello.yml/eu-north-1:       (stack not found and will be skipped)",
        )}
            name:                      hello
            status:                    ${green("CREATE_COMPLETE")}
            last change:               ${formatTimestamp(
              creationTime,
            )}      (1d ago)
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
            last change:               ${formatTimestamp(
              creationTime2,
            )}      (1d 12h ago)
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

  test("dependents are shown correctly", async () => {
    const operation1 = mockOperation("DELETE", {
      name: "example1",
      path: "/example1.yml/eu-north-1",
      region: "eu-north-1",
      dependents: ["/sample.yml/eu-central-1", "/sample2.yml/eu-central-1"],
    })

    const operation2 = mockOperation("DELETE", {
      name: "sample",
      path: "/sample.yml/eu-central-1",
      region: "eu-central-1",
    })

    const operation3 = mockOperation("DELETE", {
      name: "sample2",
      path: "/sample2.yml/eu-central-1",
      region: "eu-central-1",
      dependents: ["/sample3.yml/eu-central-1"],
    })

    const operation4 = mockOperation("DELETE", {
      name: "sample3",
      path: "/sample3.yml/eu-central-1",
      region: "eu-central-1",
    })

    const output = await confirmUndeploy(
      operation4,
      operation3,
      operation2,
      operation1,
    )
    const expected = dedent`
      
      ${bold("Review stacks undeployment plan:")}
      ${bold("--------------------------------")}
      A stacks undeployment plan has been created and is shown below.
      Stacks will be undeployed in the order they are listed, and in
      parallel when possible.
      
      Following stacks will be undeployed:

        ${red("- /sample3.yml/eu-central-1:   (stack will be removed)")}
            name:                      sample3
            status:                    ${cyan("PENDING")}
            last change:               -
            account id:                123456789012
            region:                    eu-central-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependents:                none

        ${red("- /sample2.yml/eu-central-1:   (stack will be removed)")}
            name:                      sample2
            status:                    ${cyan("PENDING")}
            last change:               -
            account id:                123456789012
            region:                    eu-central-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependents:
              - /sample3.yml/eu-central-1

        ${red("- /sample.yml/eu-central-1:    (stack will be removed)")}
            name:                      sample
            status:                    ${cyan("PENDING")}
            last change:               -
            account id:                123456789012
            region:                    eu-central-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependents:                none
      
        ${red("- /example1.yml/eu-north-1:    (stack will be removed)")}
            name:                      example1
            status:                    ${cyan("PENDING")}
            last change:               -
            account id:                123456789012
            region:                    eu-north-1
            credentials:
              user id:                 AIDARKRBVDY5HHA3SQU7Q
              account id:              123456789012
              arn:                     arn:aws:iam::123456789012:user/reiner-braun
            dependents:
              - /sample.yml/eu-central-1
              - /sample2.yml/eu-central-1

        stacks | total: 4, ${red("remove: 4")}
      
    `
    expect(output).toBe(expected)
  })
})
