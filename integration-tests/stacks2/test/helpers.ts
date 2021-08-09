import { prepareAwsEnvVariables } from "@takomo/aws-clients"
import { parseYaml } from "@takomo/util"
import { Credentials } from "aws-sdk"
import { exec } from "child_process"

const execute = async (
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

const assertRecursively = (
  path: ReadonlyArray<string>,
  actual: any,
  expected: any,
): string | undefined => {
  const actualType = typeof actual
  const expectedType = typeof expected
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      return `Expected value in path ${path.join(
        ".",
      )} to be an array but got ${actualType}`
    }

    if (expected.length !== actual.length) {
      return `Expected value in path ${path.join(
        ".",
      )} to be an array of length ${
        expected.length
      } but got an array of length ${actual.length}`
    }

    for (let i = 0; i < expected.length; i++) {
      const error = assertRecursively(
        [...path, `[${i}]`],
        actual[i],
        expected[i],
      )
      if (error) {
        return error
      }
    }
  } else if (expectedType === "object") {
    if (actualType !== "object") {
      return `Expected value in path ${path.join(
        ".",
      )} to be an object but got ${actualType}`
    }

    for (const [key, value] of Object.entries(expected)) {
      const error = assertRecursively([...path, key], actual[key], value)
      if (error) {
        return error
      }
    }

    const expectedKeys = Object.keys(expected)
    const unexpectedKeys = Object.keys(actual).filter(
      (k) => !expectedKeys.includes(k),
    )
    if (unexpectedKeys.length > 0) {
      return `Found ${
        unexpectedKeys.length
      } unexpected properties in path ${path.join(".")}: ${unexpectedKeys.join(
        ", ",
      )}`
    }
  } else if (expectedType === "function") {
    const error = expected(actual)
    if (error !== true) {
      return `Value in path ${path.join(".")} failed custom assertion: ${error}`
    }
  } else if (expected !== actual) {
    return `Expected value in path ${path.join(
      ".",
    )} to be ${expected} but got ${actual}`
  }
}

export const executeCliAndExpectSuccessAsJson = async ({
  command,
  expected,
  credentials,
}: ExecuteProps): Promise<void> => {
  const output = await execute(command ?? "", credentials)
  const actual = JSON.parse(output)
  if (expected) {
    const error = assertRecursively(["$"], actual, expected)
    if (error) {
      fail(
        `${error}\n\nactual:\n${JSON.stringify(
          actual,
          undefined,
          2,
        )}\n\nexpected:\n${JSON.stringify(expected, undefined, 2)}`,
      )
    }
  }
}

export const executeCliAndExpectSuccessAsYaml = async ({
  command,
  expected,
  credentials,
}: ExecuteProps): Promise<void> => {
  const output = await execute(command ?? "", credentials)
  const actual = parseYaml("output", output)
  if (expected) {
    const error = assertRecursively(["$"], actual, expected)
    if (error) {
      fail(
        `${error}\n\nactual:\n${JSON.stringify(
          actual,
          undefined,
          2,
        )}\n\nexpected:\n${JSON.stringify(expected, undefined, 2)}`,
      )
    }
  }
}

interface ExecuteProps {
  readonly credentials: Credentials
  readonly command?: string
  readonly expected?: any
}

export const cliExecutors = (base: string) => ({
  executeCliAndExpectSuccessAsJson: (props: ExecuteProps) =>
    executeCliAndExpectSuccessAsJson({
      ...props,
      command: `${base} ${props.command ?? ""}`,
    }),
  executeCliAndExpectSuccessAsYaml: (props: ExecuteProps) =>
    executeCliAndExpectSuccessAsYaml({
      ...props,
      command: `${base} ${props.command ?? ""}`,
    }),
})
