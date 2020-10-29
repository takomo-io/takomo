import { initOptionsAndVariables, OptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import {
  deployStacksCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { aws, TestDeployStacksIO, TestUndeployStacksIO } from "@takomo/test"
import { Credentials } from "aws-sdk"

const createOptions = async (
  variables: unknown[],
): Promise<OptionsAndVariables> => {
  const account1Id = global.reservation.accounts[0].accountId

  return initOptionsAndVariables(
    {
      log: "info",
      yes: true,
      dir: "configs/templating",
      "var-file": variables,
      var: `ACCOUNT_1_ID=${account1Id}`,
    },
    new Credentials(global.reservation.credentials),
  )
}

describe("Templating", () => {
  test("Deploy", async () => {
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

    const stack = await aws.cloudFormation.describeStack({
      credentials: new Credentials(global.reservation.credentials),
      iamRoleArn: `arn:aws:iam::${global.reservation.accounts[0].accountId}:role/OrganizationAccountAccessRole`,
      region: "eu-north-1",
      stackName: "queues",
    })
    expect(stack.Description).toBe("IT - templating World")

    const outputs = stack.Outputs!
    expect(outputs).toHaveLength(2)

    const sortedOutputs = outputs.sort((a, b) =>
      a.OutputKey!.localeCompare(b.OutputKey!),
    )

    expect(sortedOutputs[0].OutputKey).toBe("HelloParam")
    expect(sortedOutputs[0].OutputValue).toBe("World")

    expect(sortedOutputs[1].OutputKey).toBe("NumberParam")
    expect(sortedOutputs[1].OutputValue).toBe("300")
  })

  test("Undeploy", async () => {
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
  })
})
