import { initOptionsAndVariables, OptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import { deployStacksCommand } from "@takomo/stacks-commands"
import { TestDeployStacksIO, TIMEOUT } from "@takomo/test"
import { Credentials } from "aws-sdk"

const createOptions = async (): Promise<OptionsAndVariables> => {
  const account1Id = global.reservation.accounts[0].accountId
  return initOptionsAndVariables(
    {
      log: "info",
      yes: true,
      dir: "configs/ignored-stacks",
      var: `ACCOUNT_1_ID=${account1Id}`,
    },
    new Credentials(global.reservation.credentials),
  )
}

describe("Ignored stacks", () => {
  test(
    "Deploy",
    async () => {
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

      const results = output.results.sort((a, b) =>
        a.stack.getPath().localeCompare(b.stack.getPath()),
      )

      const stackPaths = results.map((r) => r.stack.getPath())
      expect(stackPaths).toStrictEqual([
        "/b/stack4.yml/eu-north-1",
        "/stack1.yml/eu-north-1",
      ])
    },
    TIMEOUT,
  )
})
