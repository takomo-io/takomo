/**
 * @testenv-recycler-count 3
 */
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
  const account2Id = global.reservation.accounts[1].accountId
  const account3Id = global.reservation.accounts[2].accountId
  return initOptionsAndVariables(
    {
      log: "info",
      yes: true,
      dir: "configs/multi-account",
      var: [
        `ACCOUNT_1_ID=${account1Id}`,
        `ACCOUNT_2_ID=${account2Id}`,
        `ACCOUNT_3_ID=${account3Id}`,
      ],
    },
    new Credentials(global.reservation.credentials),
  )
}

describe("Multi-account", () => {
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

    const [res1, res2, res3, res4] = output.results

    expect(res1.status).toBe(CommandStatus.SUCCESS)
    expect(res2.status).toBe(CommandStatus.SUCCESS)
    expect(res3.status).toBe(CommandStatus.SUCCESS)
    expect(res4.status).toBe(CommandStatus.SUCCESS)
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
