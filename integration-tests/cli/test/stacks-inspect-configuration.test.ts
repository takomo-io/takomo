import { basicCommandPaths, executors } from "./helpers"

const { expectSuccess } = executors("stacks inspect configuration")

const successCases = [
  ...basicCommandPaths,
  "-i",
  "--interactive",
  "-y",
  "--yes",
]

describe("tkm stacks inspect configuration", () => {
  test.each(successCases)("success %#", expectSuccess)
})
