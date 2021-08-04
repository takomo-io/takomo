import { executors } from "./helpers"

const { expectFailure, expectSuccess } = executors("org accounts delete-alias")

const failures = [["", "Missing required argument: account-id"]]

const successCases = ["--account-id 123456789012"]

describe("org accounts delete-alias", () => {
  test.each(failures)("failure %#", expectFailure)
  test.each(successCases)("success %#", expectSuccess)
})
