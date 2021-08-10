import { prepareAwsEnvVariables } from "@takomo/aws-clients"
import { assertRecursively } from "@takomo/test-unit"
import { parseYamlString } from "@takomo/util"
import { Credentials } from "aws-sdk"
import { exec } from "child_process"

const executeWithCli = async (
  command: string,
  credentials: Credentials,
): Promise<string> => {
  const env = prepareAwsEnvVariables({ credentials, env: process.env })
  return new Promise((resolve, reject) => {
    exec(`./bin/tkm ${command}`, { env }, (err, stdout, stderr) => {
      if (err) {
        console.log("Stderr:\n" + stderr)
        console.log("Stdout:\n" + stdout)
        console.log("Got error:", err)
        reject(err)
      }

      resolve(stdout)
    })
  })
}

export const executeWithCliAndExpectSuccessAsJson = async ({
  command,
  expected,
  credentials,
}: ExecuteProps): Promise<void> => {
  const output = await executeWithCli(command ?? "", credentials)
  const actual = JSON.parse(output)
  if (expected) {
    assertRecursively(actual, expected)
  }
}

export const executeWithCliAndExpectSuccessAsYaml = async ({
  command,
  expected,
  credentials,
}: ExecuteProps): Promise<void> => {
  const output = await executeWithCli(command ?? "", credentials)
  const actual = parseYamlString(output)
  if (expected) {
    assertRecursively(actual, expected)
  }
}

interface ExecuteProps {
  readonly credentials: Credentials
  readonly command?: string
  readonly expected?: any
}

export const cliExecutors = (base: string) => ({
  executeWithCliAndExpectSuccessAsJson: (props: ExecuteProps) =>
    executeWithCliAndExpectSuccessAsJson({
      ...props,
      command: `${base} ${props.command ?? ""}`,
    }),
  executeWithCliAndExpectSuccessAsYaml: (props: ExecuteProps) =>
    executeWithCliAndExpectSuccessAsYaml({
      ...props,
      command: `${base} ${props.command ?? ""}`,
    }),
})
