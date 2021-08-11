import { executors } from "./helpers"

const { expectFailure, expectSuccess } = executors("org create")

const failures = [
  [
    "--feature-set XXX",
    'Invalid values:\n  Argument: feature-set, Given: "XXX", Choices: "ALL", "CONSOLIDATED_BILLING"',
  ],
]

const successCases = [
  "",
  "--feature-set ALL",
  "--feature-set CONSOLIDATED_BILLING",
]

describe("org create", () => {
  test.each(failures)("failure %#", expectFailure)
  test.each(successCases)("success %#", expectSuccess)
})
