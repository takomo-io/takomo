import { exec } from "child_process"

const execute = async (command: string): Promise<string> =>
  new Promise((resolve, reject) => {
    exec(`./bin/tkm ${command}`, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      }

      resolve(stdout)
    })
  })

export const expectSuccess = async (
  command: string,
  expectedStdout?: string,
): Promise<void> => {
  const output = await execute(command)
  if (expectedStdout) {
    expect(output).toEqual(expectedStdout)
  }
}

export const expectFailure = async (
  command: string,
  expectedError: string,
): Promise<void> => expect(execute(command)).rejects.toThrow(expectedError)

export const executors = (base: string) => ({
  executeCliAndExpectSuccess: (command = "", expectedStdout?: string) =>
    expectSuccess(`${base} ${command}`, expectedStdout),
  expectFailure: (command = "", expectedError: string) =>
    expectFailure(`${base} ${command}`, expectedError),
})
