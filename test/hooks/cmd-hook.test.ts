import { Credentials } from "@aws-sdk/types"
import { mock } from "jest-mock-extended"
import { join } from "path"
import { CredentialManager } from "../../src"
import { StacksContext } from "../../src/context/stacks-context"
import { CmdHook } from "../../src/hooks/cmd-hook"
import { HookInput } from "../../src/hooks/hook"
import { Stack } from "../../src/stacks/stack"
import { createConsoleLogger } from "../../src/utils/logging"

const credentialManager = mock<CredentialManager>()
credentialManager.getCredentials.mockReturnValue(
  Promise.resolve(
    mock<Credentials>({
      accessKeyId: "xxxx",
      secretAccessKey: "yyyy",
      sessionToken: "zzzz",
    }),
  ),
)

const input: HookInput = {
  logger: createConsoleLogger({ logLevel: "info" }),
  operation: "create",
  stage: "before",
  variables: { var: {}, hooks: {}, context: { projectDir: "" }, env: {} },
  ctx: mock<StacksContext>({ projectDir: process.cwd() }),
  stack: mock<Stack>({ region: "eu-central-1", credentialManager }),
}

const expectSuccess = async (
  hook: CmdHook,
  input: HookInput,
  value: string,
): Promise<void> => {
  const output = await hook.execute(input)
  expect(output).toStrictEqual({
    message: "Success",
    success: true,
    value,
  })
}

describe("Cmd hook", () => {
  test("Execute simple command", async () => {
    const hook = new CmdHook({ command: "echo HELLO" })
    await expectSuccess(hook, input, "HELLO")
  })

  test("Capture all output", async () => {
    const hook = new CmdHook({
      command: "echo 'HELLO\nWORLD\nTODAY'",
      capture: "all",
    })
    await expectSuccess(hook, input, "HELLO\nWORLD\nTODAY")
  })

  test("Capture last line output", async () => {
    const hook = new CmdHook({
      command: "echo 'HELLO\nWORLD\nTODAY'",
      capture: "last-line",
    })
    await expectSuccess(hook, input, "TODAY")
  })

  test("Stage is exposed in environment variables", async () => {
    const hook = new CmdHook({ command: "echo $TKM_COMMAND_STAGE" })

    await expectSuccess(hook, { ...input, stage: "before" }, "before")
    await expectSuccess(hook, { ...input, stage: "after" }, "after")
  })

  test("Operation is exposed in environment variables", async () => {
    const hook = new CmdHook({ command: "echo $TKM_COMMAND_OPERATION" })

    await expectSuccess(hook, { ...input, operation: "create" }, "create")
    await expectSuccess(hook, { ...input, operation: "delete" }, "delete")
    await expectSuccess(hook, { ...input, operation: "update" }, "update")
  })

  test("Status is exposed in environment variables", async () => {
    const hook = new CmdHook({ command: "echo $TKM_COMMAND_STATUS" })

    await expectSuccess(hook, { ...input, status: "success" }, "success")
    await expectSuccess(hook, { ...input, status: "skipped" }, "skipped")
    await expectSuccess(hook, { ...input, status: "cancelled" }, "cancelled")
    await expectSuccess(hook, { ...input, status: "failed" }, "failed")
    await expectSuccess(hook, { ...input, status: undefined }, "")
  })

  test("Current working dir", async () => {
    const hook = new CmdHook({ command: "pwd" })
    await expectSuccess(hook, input, process.cwd())

    const cwd = join(process.cwd(), "test")

    const hook2 = new CmdHook({
      command: "pwd",
      cwd,
    })
    await expectSuccess(hook2, input, cwd)
  })

  test("Expose stack region", async () => {
    const hook1 = new CmdHook({
      command: "echo $AWS_DEFAULT_REGION",
      exposeStackRegion: true,
    })
    await expectSuccess(hook1, input, "eu-central-1")

    const hook2 = new CmdHook({
      command: "echo $AWS_DEFAULT_REGION",
      exposeStackRegion: false,
    })
    await expectSuccess(hook2, input, "")

    const hook3 = new CmdHook({
      command: "echo $AWS_DEFAULT_REGION",
    })
    await expectSuccess(hook3, input, "")
  })

  test("Expose stack credentials", async () => {
    const command =
      "echo $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY $AWS_SESSION_TOKEN $AWS_SECURITY_TOKEN"

    const hook1 = new CmdHook({
      command,
      exposeStackCredentials: true,
    })
    await expectSuccess(hook1, input, "xxxx yyyy zzzz zzzz")

    const hook2 = new CmdHook({
      command,
      exposeStackCredentials: false,
    })
    await expectSuccess(hook2, input, "")

    const hook3 = new CmdHook({
      command,
    })
    await expectSuccess(hook3, input, "")
  })
})
