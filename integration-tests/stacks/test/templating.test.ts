import { initOptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import {
  deployStacksCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import {
  aws,
  TestDeployStacksIO,
  TestUndeployStacksIO,
  TIMEOUT,
} from "@takomo/test"
import { ORG_A_ACCOUNT_1_ID } from "./env"

const roleArn = `arn:aws:iam::${ORG_A_ACCOUNT_1_ID}:role/OrganizationAccountAccessRole`

const createOptions = async (variables: any[]) =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs/templating",
    "var-file": variables,
  })

// First, make sure that there are no existing stacks left from previous test runs
beforeAll(async () => {
  const { options, variables, watch } = await createOptions(["queues.yml"])
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

describe("Templating", () => {
  test(
    "Deploy",
    async () => {
      const { options, variables, watch } = await createOptions(["queues.yml"])
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

      const stack = await aws.cloudFormation.describeStack(
        roleArn,
        "eu-north-1",
        "queues",
      )
      expect(stack.Description).toBe("IT - templating World")
    },
    TIMEOUT,
  )

  test(
    "Undeploy",
    async () => {
      const { options, variables, watch } = await createOptions(["queues.yml"])
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
