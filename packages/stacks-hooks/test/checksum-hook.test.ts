import { Credentials } from "@aws-sdk/types"
import { CredentialManager } from "@takomo/aws-clients"
import { HookInput, Stack, StacksContext } from "@takomo/stacks-model"
import { createConsoleLogger } from "@takomo/util"
import { mock } from "jest-mock-extended"
import { ChecksumHook } from "../src"

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
    const hook = new ChecksumHook({ dir: "test/samples" })
    await expectSuccess(hook, input, "2VmIwlMvZgGzf9K56e64uDmeAls=")
  })

  test("Hex encoding", async () => {
    const hook = new ChecksumHook({ dir: "test/samples", encoding: "hex" })
    await expectSuccess(hook, input, "667f54b3c569bdf12ffbfd2c06cf57f47b845d86")
  })
})
