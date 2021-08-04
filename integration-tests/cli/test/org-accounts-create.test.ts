import { executors } from "./helpers"

const { expectFailure, expectSuccess } = executors("org accounts create")

const failures = [["", "Missing required arguments: name, email"]]

const successCases = [
  "--name one --email mail@mail.com",
  "--name one --email mail@mail.com --iam-user-access-to-billing",
  "--name one --email mail@mail.com --ou Root",
  "--name one --email mail@mail.com --role-name admin",
]

describe("org accounts create", () => {
  test.each(failures)("failure %#", expectFailure)
  test.each(successCases)("success %#", expectSuccess)
})
