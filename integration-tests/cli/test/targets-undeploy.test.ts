import { executors, targetOperations } from "./helpers"

const { expectSuccess } = executors("targets undeploy")

const successCases = [...targetOperations]

describe("tkm targets undeploy", () => {
  test.each(successCases)("success %#", expectSuccess)
})
