/**
 * Test that only configuration files for stack groups and stacks within
 * the given command path are loaded. It should not be required to provide
 * values for variables in config files outside the command path.
 */

import { initOptionsAndVariables, OptionsAndVariables } from "@takomo/cli"
import { CommandStatus } from "@takomo/core"
import { deployStacksCommand } from "@takomo/stacks-commands"
import { TestDeployStacksIO, TIMEOUT } from "@takomo/test"
import { Credentials } from "aws-sdk"

const createOptions = async (
  variables: string[],
): Promise<OptionsAndVariables> => {
  const account1Id = global.reservation.accounts[0].accountId

  return initOptionsAndVariables(
    {
      log: "info",
      yes: true,
      dir: "configs/command-paths",
      var: [...variables, `ACCOUNT_1_ID=${account1Id}`],
    },
    new Credentials(global.reservation.credentials),
  )
}

describe("Command paths", () => {
  test(
    "Deploying '/dev/app/logs.yml' does not require providing values for variables outside the stack",
    async () => {
      const { options, variables, watch } = await createOptions([
        "devLogGroupName=myLogGroup",
      ])
      const output = await deployStacksCommand(
        {
          options,
          variables,
          watch,
          commandPath: "/dev/app/logs.yml",
          ignoreDependencies: false,
          interactive: false,
        },
        new TestDeployStacksIO(options),
      )

      const { results, status } = output
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(results).toHaveLength(1)

      const [result] = results

      expect(result.success).toBeTruthy()
      expect(result.status).toBe(CommandStatus.SUCCESS)
      expect(result.reason).toBe("CREATE_SUCCESS")
      expect(result.stack.getPath()).toBe("/dev/app/logs.yml/eu-north-1")
    },
    TIMEOUT,
  )

  test(
    "Deploying '/dev/app/sg.yml' causes stack '/dev/vpc.yml' to be deployed as well",
    async () => {
      const { options, variables, watch } = await createOptions([])
      const output = await deployStacksCommand(
        {
          options,
          variables,
          watch,
          commandPath: "/dev/app/sg.yml",
          ignoreDependencies: false,
          interactive: false,
        },
        new TestDeployStacksIO(options),
      )

      const { results, status } = output
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(results).toHaveLength(2)

      const [vpc, sg] = results

      expect(vpc.success).toBeTruthy()
      expect(vpc.status).toBe(CommandStatus.SUCCESS)
      expect(vpc.reason).toBe("CREATE_SUCCESS")
      expect(vpc.stack.getPath()).toBe("/dev/vpc.yml/eu-north-1")

      expect(sg.success).toBeTruthy()
      expect(sg.status).toBe(CommandStatus.SUCCESS)
      expect(sg.reason).toBe("CREATE_SUCCESS")
      expect(sg.stack.getPath()).toBe("/dev/app/sg.yml/eu-north-1")
    },
    TIMEOUT,
  )
})
