import { basicCommandPaths, executors } from "./helpers.js"

const { expectSuccess } = executors("stacks list")

const successCases = [...basicCommandPaths]

describe("tkm stacks list", () => {
  test.each(successCases)("success %#", expectSuccess)
})
