import { makeIamRoleArn } from "../src"

describe("#makeIamRoleArn", () => {
  test("makes correct iam role arn", () => {
    expect(makeIamRoleArn("012345678901", "admin")).toStrictEqual(
      "arn:aws:iam::012345678901:role/admin",
    )
  })
})
