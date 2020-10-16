import { initOptionsAndVariables, OptionsAndVariables } from "@takomo/cli"
import { CommandStatus, Constants } from "@takomo/core"
import {
  deployStacksCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { aws, TestDeployStacksIO, TestUndeployStacksIO } from "@takomo/test"
import { TakomoError } from "@takomo/util/src"
import { Credentials } from "aws-sdk"

const createOptions = async (
  terminationProtection: boolean,
): Promise<OptionsAndVariables> => {
  const account1Id = global.reservation.accounts[0].accountId

  return initOptionsAndVariables(
    {
      log: "info",
      yes: true,
      dir: "configs/termination-protection",
      var: [
        `ACCOUNT_1_ID=${account1Id}`,
        `terminationProtection=${terminationProtection}`,
      ],
    },
    new Credentials(global.reservation.credentials),
  )
}

describe("Termination protection", () => {
  test("Create a stack with termination protection enabled", async () => {
    const { options, variables, watch } = await createOptions(true)
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

    const stack = await aws.cloudFormation.describeStack({
      credentials: new Credentials(global.reservation.credentials),
      iamRoleArn: `arn:aws:iam::${global.reservation.accounts[0].accountId}:role/OrganizationAccountAccessRole`,
      stackName: "termination-protection",
      region: "eu-north-1",
    })
    expect(stack.EnableTerminationProtection).toBeTruthy()
  })

  test("Try to undeploy", async () => {
    const { options, variables, watch } = await createOptions(false)

    await expect(
      undeployStacksCommand(
        {
          commandPath: Constants.ROOT_STACK_GROUP_PATH,
          ignoreDependencies: false,
          interactive: false,
          options,
          variables,
          watch,
        },
        new TestUndeployStacksIO(options),
      ),
    ).rejects.toEqual(
      new TakomoError(
        "Can't undeploy stacks because following stacks have termination protection enabled:\n\n" +
          "  - /a.yml/eu-north-1",
      ),
    )
  })

  test("Disable termination protection", async () => {
    const { options, variables, watch } = await createOptions(false)
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
    expect(output.results[0].reason).toBe("UPDATE_SUCCESS")

    const stack = await aws.cloudFormation.describeStack({
      credentials: new Credentials(global.reservation.credentials),
      iamRoleArn: `arn:aws:iam::${global.reservation.accounts[0].accountId}:role/OrganizationAccountAccessRole`,
      stackName: "termination-protection",
      region: "eu-north-1",
    })
    expect(stack.EnableTerminationProtection).toBeFalsy()
  })

  test("Undeploy", async () => {
    const { options, variables, watch } = await createOptions(false)
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
