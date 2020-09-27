import { initOptionsAndVariables, OptionsAndVariables } from "@takomo/cli"
import { CommandStatus } from "@takomo/core"
import { deployStacksCommand } from "@takomo/stacks-commands"
import { TestDeployStacksIO, TIMEOUT } from "@takomo/test"
import { Credentials } from "aws-sdk"

const createOptions = async (): Promise<OptionsAndVariables> => {
  const account1Id = global.reservation.accounts[0].accountId
  return initOptionsAndVariables(
    {
      log: "info",
      yes: true,
      dir: "configs/hooks",
      var: `ACCOUNT_1_ID=${account1Id}`,
    },
    new Credentials(global.reservation.credentials),
  )
}

describe("Example: Successful hooks", () => {
  test(
    "Launch",
    async () => {
      const { options, variables, watch } = await createOptions()
      const output = await deployStacksCommand(
        {
          commandPath: "/launch/mixed/success",
          ignoreDependencies: false,
          interactive: false,
          options,
          variables,
          watch,
        },
        new TestDeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.SUCCESS)

      const [res1, res2] = output.results

      expect(res1.status).toBe(CommandStatus.SUCCESS)
      expect(res1.success).toBe(true)
      expect(res2.status).toBe(CommandStatus.SUCCESS)
      expect(res2.success).toBe(true)
    },
    TIMEOUT,
  )
})
