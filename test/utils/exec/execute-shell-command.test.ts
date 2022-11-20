import { join } from "path"
import { executeShellCommand } from "../../../src/utils/exec"

const cwd = process.cwd()
const env = process.env

const listener = (data: string) => console.log(data)

describe("#executeShellCommand", () => {
  test("Simple success case", async () => {
    const output = await executeShellCommand({
      command: "echo hello",
      cwd,
      env,
      stderrListener: listener,
      stdoutListener: listener,
    })
    expect(output.command).toStrictEqual("echo hello")
    expect(output.success).toStrictEqual(true)
    expect(output.error).toBeUndefined()
    expect(output.stderr).toStrictEqual("")
    expect(output.stdout).toStrictEqual("hello\n")
    expect(output.code).toStrictEqual(0)
    expect(output.signal).toBeUndefined()
  })

  test("Success case with cwd", async () => {
    const output = await executeShellCommand({
      command: "./script2.sh",
      cwd: join(cwd, "test/utils/exec/another"),
      env,
      stderrListener: listener,
      stdoutListener: listener,
    })
    expect(output.command).toStrictEqual("./script2.sh")
    expect(output.success).toStrictEqual(true)
    expect(output.error).toBeUndefined()
    expect(output.stderr).toStrictEqual("")
    expect(output.stdout).toStrictEqual("OK\n")
    expect(output.code).toStrictEqual(0)
    expect(output.signal).toBeUndefined()
  })

  test("Success case using cat command", async () => {
    const output = await executeShellCommand({
      command: "cat sample.txt",
      cwd: join(cwd, "test/utils/exec"),
      env,
      stderrListener: listener,
      stdoutListener: listener,
    })
    expect(output.command).toStrictEqual("cat sample.txt")
    expect(output.success).toStrictEqual(true)
    expect(output.error).toBeUndefined()
    expect(output.stderr).toStrictEqual("")
    expect(output.stdout).toStrictEqual("line 1\nline 2\nline 3\nline 4\n")
    expect(output.code).toStrictEqual(0)
    expect(output.signal).toBeUndefined()
  })

  test("Script that returns code 1", async () => {
    const output = await executeShellCommand({
      command: "./test/utils/exec/script1.sh",
      cwd,
      env,
      stderrListener: listener,
      stdoutListener: listener,
    })
    expect(output.command).toStrictEqual("./test/utils/exec/script1.sh")
    expect(output.success).toStrictEqual(false)
    expect(output.error).toEqual(
      new Error("Shell command exited with code 1.\n\nstderr:\n"),
    )
    expect(output.stderr).toStrictEqual("")
    expect(output.stdout).toStrictEqual("")
    expect(output.code).toStrictEqual(1)
    expect(output.signal).toBeUndefined()
  })
})
