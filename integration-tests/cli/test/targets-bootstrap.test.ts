import { executors, targetOperations } from "./helpers"

const { expectSuccess } = executors("targets bootstrap")

const successCases = [...targetOperations]

describe("tkm targets bootstrap", () => {
  test.each(successCases)("success %#", expectSuccess)
})
