import { basicCommandPaths, executors } from "./helpers"

const { expectSuccess } = executors("stacks deploy")

const successCases = [
  ...basicCommandPaths,
  "-i",
  "--interactive",
  "-y",
  "--yes",
  "--ignore-dependencies",
]

describe("tkm stacks deploy", () => {
  test.each(successCases)("success %#", expectSuccess)
})
