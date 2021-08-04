import { basicCommandPaths, executors } from "./helpers"

const { expectSuccess } = executors("stacks inspect dependency-graph")

const successCases = [...basicCommandPaths]

describe("tkm stacks inspect dependency-graph", () => {
  test.each(successCases)("success %#", expectSuccess)
})
