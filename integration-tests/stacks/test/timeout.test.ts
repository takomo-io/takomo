import { initOptionsAndVariables, OptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import {
  deployStacksCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { TestDeployStacksIO, TestUndeployStacksIO, TIMEOUT } from "@takomo/test"
import { Credentials } from "aws-sdk"

const createOptions = async (
  variables: unknown[],
): Promise<OptionsAndVariables> => {
  const account1Id = global.reservation.accounts[0].accountId

  return initOptionsAndVariables(
    {
      log: "info",
      yes: true,
      dir: "configs/timeout",
      var: [...variables, `ACCOUNT_1_ID=${account1Id}`],
    },
    new Credentials(global.reservation.credentials),
  )
}

describe("Timeout", () => {
  test(
    "Deploy should fail due timeout",
    async () => {
      const { options, variables, watch } = await createOptions([
        "create_wait_condition=true",
        "create_second_topic=false",
      ])
      const output = await deployStacksCommand(
        {
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
          options,
          variables,
          ignoreDependencies: false,
          interactive: false,
          watch,
        },
        new TestDeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.FAILED)
      expect(output.success).toBeFalsy()
      expect(output.results[0].success).toBeFalsy()
      expect(output.results[0].reason).toBe("CREATE_FAILED")
    },
    TIMEOUT,
  )

  test(
    "Deploying again should succeed when the failing resources are not created",
    async () => {
      const { options, variables, watch } = await createOptions([
        "create_wait_condition=false",
        "create_second_topic=false",
      ])
      const output = await deployStacksCommand(
        {
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
          options,
          variables,
          ignoreDependencies: false,
          interactive: false,
          watch,
        },
        new TestDeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.SUCCESS)
      expect(output.success).toBeTruthy()
      expect(output.results[0].reason).toBe("CREATE_SUCCESS")
    },
    TIMEOUT,
  )

  test(
    "Deploying should fail due timeout",
    async () => {
      const { options, variables, watch } = await createOptions([
        "create_wait_condition=true",
        "create_second_topic=true",
      ])
      const output = await deployStacksCommand(
        {
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
          options,
          variables,
          ignoreDependencies: false,
          interactive: false,
          watch,
        },
        new TestDeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.FAILED)
      expect(output.success).toBeFalsy()
      expect(output.results[0].success).toBeFalsy()
      expect(output.results[0].reason).toBe("UPDATE_FAILED")
    },
    TIMEOUT,
  )

  test(
    "Deploying stack again should succeed when the failing resources are not created",
    async () => {
      const { options, variables, watch } = await createOptions([
        "create_wait_condition=false",
        "create_second_topic=true",
      ])
      const output = await deployStacksCommand(
        {
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
          options,
          variables,
          ignoreDependencies: false,
          interactive: false,
          watch,
        },
        new TestDeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.SUCCESS)
      expect(output.success).toBeTruthy()
      expect(output.results[0].reason).toBe("UPDATE_SUCCESS")
    },
    TIMEOUT,
  )

  test(
    "Undeploy",
    async () => {
      const { options, variables, watch } = await createOptions([
        "create_wait_condition=false",
        "create_second_topic=true",
      ])
      const output = await undeployStacksCommand(
        {
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
          ignoreDependencies: false,
          interactive: false,
          options,
          variables,
          watch,
        },
        new TestUndeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.SUCCESS)
    },
    TIMEOUT,
  )
})
