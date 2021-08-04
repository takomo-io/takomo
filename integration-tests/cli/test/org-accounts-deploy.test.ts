import { accountOperations, executors } from "./helpers"

const { expectSuccess } = executors("org accounts deploy")

const successCases = [...accountOperations]

describe("org accounts deploy", () => {
  test.each(successCases)("success %#", expectSuccess)
})
