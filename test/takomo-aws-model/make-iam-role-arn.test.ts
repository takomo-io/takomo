import { makeIamRoleArn } from "../../src/takomo-aws-model"

describe("#makeIamRoleArn", () => {
  test("makes correct iam role arn", () => {
    expect(makeIamRoleArn("012345678901", "admin")).toStrictEqual(
      "arn:aws:iam::012345678901:role/admin",
    )
  })
})
