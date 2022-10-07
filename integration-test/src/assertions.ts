import { toPrettyJson } from "../../src/takomo-util"

const assertRecursivelyInternal = (
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
      const error = assertRecursivelyInternal(
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
      const error = assertRecursivelyInternal(
        [...path, key],
        actual[key],
        value,
      )
      if (error) {
        return error
      }
    }

    const expectedKeys = Object.keys(expected)
    const unexpectedKeys = Object.keys(actual).filter(
      (k) => !expectedKeys.includes(k),
    )

    if (unexpectedKeys.length > 0) {
      const keyValuePairs = unexpectedKeys
        .map((key) => `  ${key} = ${actual[key]}`)
        .join("\n")

      return `Found ${
        unexpectedKeys.length
      } unexpected properties in path ${path.join(".")}:\n${keyValuePairs}`
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

export const assertRecursively = (actual: unknown, expected: unknown): void => {
  const error = assertRecursivelyInternal(["$"], actual, expected)
  if (error) {
    throw new Error(
      `${error}\n\nactual:\n${toPrettyJson(
        actual,
      )}\n\nexpected:\n${toPrettyJson(expected)}`,
    )
  }
}

export const isDefined = (a: unknown): boolean | string =>
  a !== undefined || "Expected to be defined"

export const isNumber = (a: unknown): boolean | string => {
  const type = typeof a
  return type === "number" || `Expected to a number but got ${type}`
}
