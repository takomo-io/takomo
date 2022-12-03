import { Credentials } from "@aws-sdk/types"
import { mock } from "jest-mock-extended"
import { StacksContext } from "../../src/context/stacks-context"
import { ChecksumHook } from "../../src/hooks/checksum-hook"
import { HookInput } from "../../src/hooks/hook"
import { Stack } from "../../src/stacks/stack"
import { CredentialManager } from "../../src/takomo-aws-clients"
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
  hook: ChecksumHook,
  input: HookInput,
  value: string,
): Promise<void> => {
  const output = await hook.execute(input)
  expect(output).toStrictEqual({
    success: true,
    value,
  })
}

describe("Checksum Hook", () => {
  test("From dir", async () => {
    const hook = new ChecksumHook({ dir: "test/hooks/samples" })
    await expectSuccess(hook, input, "2VmIwlMvZgGzf9K56e64uDmeAls=")
  })

  test("Hex encoding", async () => {
    const hook = new ChecksumHook({
      dir: "test/hooks/samples",
      encoding: "hex",
    })
    await expectSuccess(hook, input, "667f54b3c569bdf12ffbfd2c06cf57f47b845d86")
  })
})