import { expectFailure, expectSuccess } from "./helpers"

const failures = [
  [
    "iam generate-policies",
    "Missing required arguments: identity, start-time, end-time, region",
  ],
]

describe("tkm iam generate-policies", () => {
  test.each(failures)("failure %#", expectFailure)
  test("success", () =>
    expectSuccess(
      "iam generate-policies --start-time 2021-05-02T16:45:54.169Z" +
        "  --end-time 2021-05-02T16:45:54.462Z" +
        "  --identity arn:aws:iam::123456789012:user/john@example.com" +
        "  --region eu-west-1" +
        "  --region us-east-1",
    ))
})
