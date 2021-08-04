import { executors } from "./helpers"

const { expectFailure, expectSuccess } = executors("org accounts list")

// const failures = [
//   [
//     "--feature-set XXX",
//     'Invalid values:\n  Argument: feature-set, Given: "XXX", Choices: "ALL", "CONSOLIDATED_BILLING"',
//   ],
// ]

const successCases = [""]

describe("org accounts list", () => {
  // test.each(failures)("failure %#", expectFailure)
  test.each(successCases)("success %#", expectSuccess)
})
