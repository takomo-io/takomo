import { executors } from "./helpers"

const { expectSuccess } = executors("org accounts list")

const successCases = [""]

describe("org accounts list", () => {
  test.each(successCases)("success %#", expectSuccess)
})
