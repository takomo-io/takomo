import { executors } from "./helpers"

const { expectSuccess } = executors("org describe")

const successCases = [""]

describe("org describe", () => {
  test.each(successCases)("success %#", expectSuccess)
})
