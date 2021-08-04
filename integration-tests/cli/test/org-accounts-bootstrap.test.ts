import { accountOperations, executors } from "./helpers"

const { expectFailure, expectSuccess } = executors("org accounts bootstrap")

// const failures = [
//   [
//     "--feature-set XXX",
//     'Invalid values:\n  Argument: feature-set, Given: "XXX", Choices: "ALL", "CONSOLIDATED_BILLING"',
//   ],
// ]

const successCases = [...accountOperations]

describe("org accounts bootstrap", () => {
  // test.each(failures)("failure %#", expectFailure)
  test.each(successCases)("success %#", expectSuccess)
})
