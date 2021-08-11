import { accountOperations, executors } from "./helpers"

const { expectSuccess } = executors("org accounts tear-down")

const successCases = [...accountOperations]

describe("org accounts tear-down", () => {
  test.each(successCases)("success %#", expectSuccess)
})
