import { initOptionsAndVariables, OptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import {
  deployStacksCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { TestDeployStacksIO, TestUndeployStacksIO } from "@takomo/test"
import { Credentials } from "aws-sdk"

const createOptions = async (): Promise<OptionsAndVariables> => {
  const account1Id = global.reservation.accounts[0].accountId
  return initOptionsAndVariables(
    {
      log: "info",
      yes: true,
      dir: "configs/cmd-resolver",
      var: `ACCOUNT_1_ID=${account1Id}`,
    },
    new Credentials(global.reservation.credentials),
  )
}

describe("Cmd Resolver", () => {
  test("Deploy", async () => {
    const { options, variables, watch } = await createOptions()
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
    expect(output.results[0].success).toBeTruthy()
    expect(output.results[0].status).toBe(CommandStatus.SUCCESS)
    expect(output.results[0].reason).toBe("CREATE_SUCCESS")
  })

  test("Undeploy", async () => {
    const { options, variables, watch } = await createOptions()
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
