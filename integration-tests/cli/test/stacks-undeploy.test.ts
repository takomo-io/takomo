import { executors } from "./helpers"

const { expectFailure, expectSuccess } = executors("stacks undeploy")

// const failures = [
//   [
//     "iam generate-policies",
//     "Missing required arguments: identity, start-time, end-time, region",
//   ],
//   [
//     "iam generate-policies " +
//       "--start-time xxx " +
//       "--end-time 2021-05-02T16:45:54.462Z " +
//       "--identity arn:aws:iam::123456789012:user/john@example.com " +
//       "--region us-east-1",
//     "option --start-time has invalid value - 'xxx' is not a valid ISO 8601 date",
//   ],
//   [
//     "iam generate-policies " +
//       "--start-time 2021-05-02T16:45:54.462Z " +
//       "--end-time yyy " +
//       "--identity arn:aws:iam::123456789012:user/john@example.com " +
//       "--region us-east-1",
//     "option --end-time has invalid value - 'yyy' is not a valid ISO 8601 date",
//   ],
// ]

describe("tkm stacks undeploy", () => {
  // test.each(failures)("failure %#", expectFailure)
  test("success", () => expectSuccess())
})
