import { basicCommandPaths, executors } from "./helpers.js"

const { expectSuccess } = executors("stacks undeploy")

const successCases = [
  ...basicCommandPaths,
  "-i",
  "--interactive",
  "-y",
  "--yes",
  "--ignore-dependencies",
]

describe("tkm stacks undeploy", () => {
  test.each(successCases)("success %#", expectSuccess)
})
