import { initOptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import {
  deployStacksCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { TestDeployStacksIO, TestUndeployStacksIO } from "./io"
import { TIMEOUT } from "./test-constants"

const createOptions = async () =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs/parameters",
  })

// First, make sure that there are no existing stacks left from previous test runs
beforeAll(async () => {
  const { options, variables, watch } = await createOptions()
  return await undeployStacksCommand(
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
}, TIMEOUT)

describe("Parameters", () => {
  test(
    "Launch",
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
      expect(output.results[0].success).toBeTruthy()
      expect(output.results[0].status).toBe(CommandStatus.SUCCESS)
      expect(output.results[0].reason).toBe("CREATE_SUCCESS")
      // TODO: Add more assertions
    },
    TIMEOUT,
  )
})
