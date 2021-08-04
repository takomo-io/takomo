import { accountOperations, executors } from "./helpers"

const { expectSuccess } = executors("org accounts bootstrap")

const successCases = [...accountOperations]

describe("org accounts bootstrap", () => {
  test.each(successCases)("success %#", expectSuccess)
})
