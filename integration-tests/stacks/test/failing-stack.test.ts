import { initOptionsAndVariables, OptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import {
  deployStacksCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { TestDeployStacksIO, TestUndeployStacksIO } from "@takomo/test"
import { Credentials } from "aws-sdk"

const createOptions = async (
  variables: string[],
): Promise<OptionsAndVariables> => {
  const account1Id = global.reservation.accounts[0].accountId
  return initOptionsAndVariables(
    {
      log: "info",
      yes: true,
      dir: "configs/failing-stack",
      var: [...variables, `ACCOUNT_1_ID=${account1Id}`],
    },
    new Credentials(global.reservation.credentials),
  )
}

describe("Failing stack", () => {
  test("Deploy should fail", async () => {
    const { options, variables, watch } = await createOptions([
      "create_wait_condition=true",
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
  })

  test("Deploying again should succeed when the failing resources are not created", async () => {
    const { options, variables, watch } = await createOptions([
      "create_wait_condition=false",
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
  })

  test("Undeploy", async () => {
    const { options, variables, watch } = await createOptions([
      "create_wait_condition=false",
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
  })
})
