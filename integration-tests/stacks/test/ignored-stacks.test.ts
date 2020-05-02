import { initOptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import { deployStacksCommand, undeployStacksCommand } from "@takomo/stacks"
import { TestDeployStacksIO, TestUndeployStacksIO } from "./io"
import { TIMEOUT } from "./test-constants"

const createOptions = async () =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs/ignored-stacks",
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

describe("Ignored stacks", () => {
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

      const results = output.results.sort((a, b) =>
        a.stack.getPath().localeCompare(b.stack.getPath()),
      )

      const stackPaths = results.map(r => r.stack.getPath())
      expect(stackPaths).toStrictEqual([
        "/b/stack4.yml/eu-north-1",
        "/stack1.yml/eu-north-1",
      ])
    },
    TIMEOUT,
  )
})
