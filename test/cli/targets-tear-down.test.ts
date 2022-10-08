import { executors, targetOperations } from "./helpers"

const { expectSuccess } = executors("targets tear-down")

const successCases = [...targetOperations]

describe("tkm targets tear-down", () => {
  test.each(successCases)("success %#", expectSuccess)
})
