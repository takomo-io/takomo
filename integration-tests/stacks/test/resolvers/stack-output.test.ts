import { initOptionsAndVariables, OptionsAndVariables } from "@takomo/cli"
import { CliListStacksIO } from "@takomo/cli-io"
import { CommandStatus, Constants } from "@takomo/core"
import {
  deployStacksCommand,
  listStacksCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { TestDeployStacksIO, TestUndeployStacksIO } from "@takomo/test"
import { Credentials } from "aws-sdk"

const createOptions = async (): Promise<OptionsAndVariables> => {
  const account1Id = global.reservation.accounts[0].accountId
  return initOptionsAndVariables(
    {
      log: "debug",
      yes: true,
      dir: "configs/resolvers/stack-output",
      var: `ACCOUNT_1_ID=${account1Id}`,
    },
    new Credentials(global.reservation.credentials),
  )
}

describe("resolvers/stack-output", () => {
  test("Deploy", async () => {
    const { options, variables, watch } = await createOptions()
    const output = await deployStacksCommand(
      {
        commandPath: Constants.ROOT_STACK_GROUP_PATH,
        ignoreDependencies: false,
        interactive: false,
        options,
        variables,
        watch,
      },
      new TestDeployStacksIO(options),
    )

    expect(output.status).toBe(CommandStatus.SUCCESS)
    expect(output.results).toHaveLength(2)

    const [a, b] = output.results
    expect(a.success).toBeTruthy()
    expect(b.success).toBeTruthy()
  })

  test("List all stacks", async () => {
    const { options, variables, watch } = await createOptions()
    const output = await listStacksCommand(
      {
        commandPath: "/",
        options,
        variables,
        watch,
      },
      new CliListStacksIO(options),
    )

    expect(output).stacksOperationOutputToBeSuccess()
    expect(output.stacks).toHaveLength(2)

    const [stack1, stack2] = output.stacks

    expect(stack1.stack.getPath()).toBe("/vpc.yml/eu-west-1")
    expect(stack1.current?.StackStatus).toBe("CREATE_COMPLETE")

    expect(stack2.stack.getPath()).toBe("/security-groups.yml/eu-west-1")
    expect(stack2.current?.StackStatus).toBe("CREATE_COMPLETE")
  })

  test("List stacks by path", async () => {
    const { options, variables, watch } = await createOptions()
    const output = await listStacksCommand(
      {
        commandPath: "/security-groups.yml",
        options,
        variables,
        watch,
      },
      new CliListStacksIO(options),
    )

    expect(output).stacksOperationOutputToBeSuccess()
    expect(output.stacks).toHaveLength(1)

    const [stack1] = output.stacks

    expect(stack1.stack.getPath()).toBe("/security-groups.yml/eu-west-1")
    expect(stack1.current?.StackStatus).toBe("CREATE_COMPLETE")
  })

  test("Deploy with ignore dependencies", async () => {
    const { options, variables, watch } = await createOptions()
    const output = await deployStacksCommand(
      {
        commandPath: "/security-groups.yml",
        ignoreDependencies: true,
        interactive: false,
        options,
        variables,
        watch,
      },
      new TestDeployStacksIO(options),
    )

    expect(output.status).toBe(CommandStatus.SKIPPED)
    expect(output.results).toHaveLength(1)

    const [a] = output.results
    expect(a.success).toBeTruthy()
    expect(a.stack.getPath()).toBe("/security-groups.yml/eu-west-1")
  })

  test("Undeploy", async () => {
    const { options, variables, watch } = await createOptions()
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

    expect(output).stacksOperationOutputToBeSuccess()
    expect(output.results).toHaveLength(2)

    const [a, b] = output.results
    expect(a.success).toBeTruthy()
    expect(b.success).toBeTruthy()
  })
})
