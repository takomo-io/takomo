import { executors, targetOperations } from "./helpers"

const { expectSuccess } = executors("targets deploy")

const successCases = [...targetOperations]

describe("tkm targets deploy", () => {
  test.each(successCases)("success %#", expectSuccess)
})
