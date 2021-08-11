import { executors } from "./helpers"

const { expectSuccess } = executors("org deploy")

const successCases = [""]

describe("org deploy", () => {
  test.each(successCases)("success %#", expectSuccess)
})
