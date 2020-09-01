import { initOptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import {
  ConfirmDeployAnswer,
  ConfirmStackDeployAnswer,
  deployStacksCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { TestDeployStacksIO, TestUndeployStacksIO, TIMEOUT } from "@takomo/test"

const createOptions = async (yes: boolean, template: string) =>
  initOptionsAndVariables({
    yes,
    log: "info",
    dir: "configs/stack-creation-with-review-fails",
    var: `template=${template}`,
  })

// First, make sure that there are no existing stacks left from previous test runs
beforeAll(async () => {
  const { options, variables, watch } = await createOptions(
    true,
    "template.yml",
  )
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

describe("Stack creation with review fails", () => {
  test(
    "Deploy with review should fail",
    async () => {
      const { options, variables, watch } = await createOptions(
        false,
        "template-with-error.yml",
      )
      const output = await deployStacksCommand(
        {
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
          options,
          variables,
          ignoreDependencies: false,
          interactive: false,
          watch,
        },
        new TestDeployStacksIO(options, {
          confirmDeploy: ConfirmDeployAnswer.CONTINUE_AND_REVIEW,
          confirmStackDeploy:
            ConfirmStackDeployAnswer.CONTINUE_AND_SKIP_REMAINING_REVIEWS,
        }),
      )

      expect(output.status).toBe(CommandStatus.FAILED)
      expect(output.results[0].success).toBeFalsy()
      expect(output.results[0].message).toBe(
        "Template format error: YAML not well-formed. (line 2, column 44)",
      )
      expect(output.results[0].status).toBe(CommandStatus.FAILED)
      expect(output.results[0].reason).toBe("CREATE_CHANGE_SET_FAILED")
    },
    TIMEOUT,
  )

  test(
    "Deploy without review should fail",
    async () => {
      const { options, variables, watch } = await createOptions(
        true,
        "template-with-error.yml",
      )
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
      expect(output.results[0].success).toBeFalsy()
      expect(output.results[0].message).toBe("Failure")
      expect(output.results[0].status).toBe(CommandStatus.FAILED)
      expect(output.results[0].reason).toBe("CREATE_FAILED")
    },
    TIMEOUT,
  )

  test(
    "Deploy with valid template should succeed",
    async () => {
      const { options, variables, watch } = await createOptions(
        true,
        "template.yml",
      )
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
      expect(output.results[0].message).toBe("Success")
      expect(output.results[0].status).toBe(CommandStatus.SUCCESS)
      expect(output.results[0].reason).toBe("CREATE_SUCCESS")
    },
    TIMEOUT,
  )

  test(
    "Undeploy",
    async () => {
      const { options, variables, watch } = await createOptions(
        true,
        "template.yml",
      )
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
    },
    TIMEOUT,
  )
})
