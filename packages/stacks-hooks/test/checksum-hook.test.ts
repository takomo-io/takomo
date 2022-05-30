import { HookInput } from "@takomo/stacks-model"
import { ChecksumHook } from "../src"
import { mockHookInput } from "./helpers"

const input = mockHookInput()

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
