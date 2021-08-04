import { accountOperations, executors } from "./helpers"

const { expectSuccess } = executors("org accounts undeploy")

const successCases = [...accountOperations]

describe("org accounts undeploy", () => {
  test.each(successCases)("success %#", expectSuccess)
})
