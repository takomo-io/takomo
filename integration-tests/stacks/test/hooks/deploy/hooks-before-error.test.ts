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

describe("Example: Before hook that fails on error ", () => {
  test(
    "Launch",
    async () => {
      const { options, variables, watch } = await createOptions()
      const output = await deployStacksCommand(
        {
          commandPath: "/launch/before/error",
          ignoreDependencies: false,
          interactive: false,
          options,
          variables,
          watch,
        },
        new TestDeployStacksIO(options),
      )

      expect(output.status).toBe(CommandStatus.FAILED)

      const [res1, res2, res3] = output.results

      expect(res1.stack.getPath()).toBe(
        "/launch/before/error/stack-1.yml/eu-west-1",
      )
      expect(res1.status).toBe(CommandStatus.SUCCESS)
      expect(res1.success).toBe(true)

      expect(res2.stack.getPath()).toBe(
        "/launch/before/error/stack-2.yml/eu-west-1",
      )
      expect(res2.status).toBe(CommandStatus.FAILED)
      expect(res2.success).toBe(false)
      expect(res2.message).toBe("Oh no!")
      expect(res2.reason).toBe("BEFORE_HOOKS_FAILED")

      expect(res3.stack.getPath()).toBe(
        "/launch/before/error/stack-3.yml/eu-west-1",
      )
      expect(res3.status).toBe(CommandStatus.CANCELLED)
      expect(res3.success).toBe(false)
      expect(res3.reason).toBe("DEPENDENCIES_FAILED")
    },
    TIMEOUT,
  )
})
