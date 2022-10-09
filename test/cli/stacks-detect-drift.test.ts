import { basicCommandPaths, executors } from "./helpers"

const { expectSuccess } = executors("stacks detect-drift")

const successCases = [...basicCommandPaths]

describe("tkm stacks detect-drift", () => {
  test.each(successCases)("success %#", expectSuccess)
})
