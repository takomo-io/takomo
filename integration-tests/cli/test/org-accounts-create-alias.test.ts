import { executors } from "./helpers"

const { expectFailure, expectSuccess } = executors("org accounts create-alias")

const failures = [["", "Missing required arguments: alias, account-id"]]

const successCases = ["--alias one --account-id 123456789012"]

describe("org accounts create-alias", () => {
  test.each(failures)("failure %#", expectFailure)
  test.each(successCases)("success %#", expectSuccess)
})
