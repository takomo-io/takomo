import { initOptionsAndVariables } from "@takomo/cli"
import { CommandStatus } from "@takomo/core"
import {
  deployStacksCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { TestDeployStacksIO, TestUndeployStacksIO } from "../../io"
import { TIMEOUT } from "../../test-constants"

const createOptions = async () =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs/hooks",
  })

// First, make sure that there are no existing stacks left from previous test runs
beforeAll(async () => {
  const { options, variables, watch } = await createOptions()
  return await undeployStacksCommand(
    {
      commandPath: "/launch/mixed/success",
      ignoreDependencies: false,
      interactive: false,
      options,
      variables,
      watch,
    },
    new TestUndeployStacksIO(options),
  )
}, TIMEOUT)

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
