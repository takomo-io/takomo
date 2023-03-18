import { basicCommandPaths, executors } from "./helpers.js"

const { expectSuccess } = executors("stacks inspect configuration")

const successCases = [
  ...basicCommandPaths,
  "-i",
  "--interactive",
  "-y",
  "--yes",
]

describe("tkm stacks inspect configuration", () => {
  test.each(successCases)("success %#", async (cmd) => expectSuccess(cmd))
})
