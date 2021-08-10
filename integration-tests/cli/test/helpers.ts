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
  expectSuccess: (command = "", expectedStdout?: string) =>
    expectSuccess(`${base} ${command}`, expectedStdout),
  expectFailure: (command = "", expectedError: string) =>
    expectFailure(`${base} ${command}`, expectedError),
})

export const basicCommandPaths = ["", "/", "/dev", "/prod/app"]
export const accountOperations = [
  "",
  "Root",
  "Root/Another First",
  "-a 123456789012",
  "-a 123456789012 -a 123456789013",
  "--account-id 123456789012",
  "--account-id 123456789012 --account-id 123456789013",
  "--concurrent-accounts 5",
  "--concurrent-accounts 5 --account-id 123456789012",
  "--concurrent-accounts 5 -a 123456789013",
]
export const targetOperations = [
  "",
  "all",
  "all/another",
  "one two",
  "--concurrent-targets 10",
  "--target example",
  "--exclude-target foobar",
  "--label one",
  "--label one --label two",
  "--exclude-label one --exclude-label two",
  "--exclude-label one --label two",
  "--command-path /",
  "--config-set one",
  "--config-file file.yml",
]
