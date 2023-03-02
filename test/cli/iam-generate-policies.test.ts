import { executors } from "./helpers.js"

const { expectFailure, expectSuccess } = executors("iam generate-policies")

const failures = [
  ["", "Missing required arguments: identity, start-time, end-time, region"],
  [
    "--start-time xxx " +
      "--end-time 2021-05-02T16:45:54.462Z " +
      "--identity arn:aws:iam::123456789012:user/john@example.com " +
      "--region us-east-1",
    "option --start-time has invalid value - 'xxx' is not a valid ISO 8601 date",
  ],
  [
    "--start-time 2021-05-02T16:45:54.462Z " +
      "--end-time yyy " +
      "--identity arn:aws:iam::123456789012:user/john@example.com " +
      "--region us-east-1",
    "option --end-time has invalid value - 'yyy' is not a valid ISO 8601 date",
  ],
]

describe("tkm iam generate-policies", () => {
  test.each(failures)("failure %#", expectFailure)
  test("success", () =>
    expectSuccess(
      "--start-time 2021-05-02T16:45:54.169Z " +
        "--end-time 2021-05-02T16:45:54.462Z " +
        "--identity arn:aws:iam::123456789012:user/john@example.com " +
        "--region eu-west-1 " +
        "--region us-east-1",
    ))
})
