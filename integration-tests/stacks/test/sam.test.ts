/**
 * Tests creating, updating and deleting of SAM stacks, with and without
 * reviewing of changes (the --yes cli option).
 *
 * SAM related documentation: https://docs.aws.amazon.com/serverless-application-model/index.html
 */

import { initOptionsAndVariables, OptionsAndVariables } from "@takomo/cli/src"
import { CommandStatus } from "@takomo/core"
import { Constants } from "@takomo/core/src"
import {
  ConfirmDeployAnswer,
  ConfirmStackDeployAnswer,
  ConfirmUndeployAnswer,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import {
  deployStacksCommand,
  StacksOperationOutput,
} from "@takomo/stacks-commands/src"
import { StackResult } from "@takomo/stacks-model/src"
import { TestUndeployStacksIO } from "@takomo/test"
import { TestDeployStacksIO } from "@takomo/test/src"
import { Credentials } from "aws-sdk"

const createOptions = async (
  timeout: number,
  yes: boolean,
): Promise<OptionsAndVariables> => {
  const account1Id = global.reservation.accounts[0].accountId
  return initOptionsAndVariables(
    {
      yes,
      log: "info",
      dir: "configs/sam",
      var: [`ACCOUNT_1_ID=${account1Id}`, `timeout=${timeout}`],
    },
    new Credentials(global.reservation.credentials),
  )
}

const deploy = async (
  timeout: number,
  yes: boolean,
): Promise<StacksOperationOutput> => {
  const { options, variables, watch } = await createOptions(timeout, yes)
  return deployStacksCommand(
    {
      options,
      variables,
      watch,
      commandPath: Constants.ROOT_STACK_GROUP_PATH,
      ignoreDependencies: false,
      interactive: false,
    },
    new TestDeployStacksIO(options, {
      confirmStackDeploy: ConfirmStackDeployAnswer.CONTINUE,
      confirmDeploy: ConfirmDeployAnswer.CONTINUE_AND_REVIEW,
    }),
  )
}

const undeploy = async (yes: boolean): Promise<StacksOperationOutput> => {
  const { options, variables, watch } = await createOptions(1, yes)
  return undeployStacksCommand(
    {
      options,
      variables,
      watch,
      commandPath: Constants.ROOT_STACK_GROUP_PATH,
      ignoreDependencies: false,
      interactive: false,
    },
    new TestUndeployStacksIO(options, {
      confirmUndeploy: ConfirmUndeployAnswer.CONTINUE,
    }),
  )
}

const expectSuccessResult = (
  result: StackResult,
  expectedReason: string,
  expectedMessage = "Success",
): void => {
  expect(result.success).toBeTruthy()
  expect(result.message).toBe(expectedMessage)
  expect(result.status).toBe(CommandStatus.SUCCESS)
  expect(result.reason).toBe(expectedReason)
}

const expectSkippedResult = (
  result: StackResult,
  expectedReason: string,
  expectedMessage = "Skipped",
): void => {
  expect(result.success).toBeTruthy()
  expect(result.message).toBe(expectedMessage)
  expect(result.status).toBe(CommandStatus.SKIPPED)
  expect(result.reason).toBe(expectedReason)
}

describe("SAM", () => {
  test("Deploy", async () => {
    const output = await deploy(1, true)
    expect(output).stacksOperationOutputToBeSuccess()
    expect(output.results).toHaveLength(1)
    expectSuccessResult(output.results[0], "CREATE_SUCCESS")
  })

  test("Deploy with no changes", async () => {
    const output = await deploy(1, true)
    expect(output).stacksOperationOutputToBeSuccess()
    expect(output.results).toHaveLength(1)
    expectSuccessResult(output.results[0], "UPDATE_SUCCESS")
  })

  test("Deploy with changes", async () => {
    const output = await deploy(2, true)
    expect(output).stacksOperationOutputToBeSuccess()
    expect(output.results).toHaveLength(1)
    expectSuccessResult(output.results[0], "UPDATE_SUCCESS")
  })

  test("Undeploy", async () => {
    const output = await undeploy(true)
    expect(output).stacksOperationOutputToBeSuccess()
    expect(output.results).toHaveLength(1)
    expectSuccessResult(output.results[0], "DELETE_SUCCESS")
  })

  test("Deploy with review", async () => {
    const output = await deploy(1, false)
    expect(output).stacksOperationOutputToBeSuccess()
    expect(output.results).toHaveLength(1)
    expectSuccessResult(output.results[0], "CREATE_SUCCESS")
  })

  test("Deploy with review and no changes", async () => {
    const output = await deploy(1, false)
    expect(output).stacksOperationOutputToBeSkipped()
    expect(output.results).toHaveLength(1)
    expectSkippedResult(output.results[0], "SKIPPED", "No changes")
  })

  test("Deploy with review and changes", async () => {
    const output = await deploy(2, false)
    expect(output).stacksOperationOutputToBeSuccess()
    expect(output.results).toHaveLength(1)
    expectSuccessResult(output.results[0], "UPDATE_SUCCESS")
  })

  test("Undeploy with review", async () => {
    const output = await undeploy(false)
    expect(output).stacksOperationOutputToBeSuccess()
    expect(output.results).toHaveLength(1)
    expectSuccessResult(output.results[0], "DELETE_SUCCESS")
  })
})
