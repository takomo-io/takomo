import { spawn } from "child_process"
interface RunShellCommandProps {
  readonly command: string
  readonly cwd: string
  readonly env: any
  readonly stdoutListener?: (data: string) => void
  readonly stderrListener?: (data: string) => void
}

interface RunShellCommandOutput {
  readonly command: string
  readonly stdout: string
  readonly stderr: string
  readonly success: boolean
  readonly error?: Error
  readonly code?: number
  readonly signal?: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (data: string): void => {}

export const executeShellCommand = ({
  command,
  env,
  cwd,
  stdoutListener = noop,
  stderrListener = noop,
}: RunShellCommandProps): Promise<RunShellCommandOutput> => {
  const child = spawn(command, [], {
    shell: true,
    env,
    cwd,
  })

  let stdout = ""
  let stderr = ""

  child.stdout.on("data", (data) => {
    const str = data.toString()
    stdout += str
    str.split("\n").forEach((s: string) => stdoutListener(s))
  })

  child.stderr.on("data", (data) => {
    const str = data.toString()
    stderr += str
    str.split("\n").forEach((s: string) => stderrListener(s))
  })

  return new Promise((resolve) => {
    child.on("error", (error) => {
      resolve({
        error,
        command,
        stdout,
        stderr,
        success: false,
      })
    })
    child.on("exit", (code, signal) => {
      if (signal) {
        resolve({
          command,
          stdout,
          stderr,
          error: new Error(`Command exited with signal ${signal}`),
          code: code ?? undefined,
          success: false,
        })
      } else if (code !== 0) {
        resolve({
          command,
          stdout,
          stderr,
          error: new Error(`Command exited with code ${code}`),
          code: code ?? undefined,
          success: false,
        })
      } else {
        resolve({
          command,
          stdout,
          stderr,
          code,
          success: true,
        })
      }
    })
  })
}
