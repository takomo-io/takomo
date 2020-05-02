import { parseCommandRole } from "../../src/parser"

describe("#parseCommandRole", () => {
  describe("should return null", () => {
    it("when a null value is given", () => {
      expect(parseCommandRole(null)).toBeNull()
    })
    it("when an undefined value is given", () => {
      expect(parseCommandRole(undefined)).toBeNull()
    })
  })
  describe("should return valid value", () => {
    it("when valid IAM role arn is given", () => {
      expect(
        parseCommandRole("arn:aws:iam::123456789012:role/admin"),
      ).toStrictEqual({
        iamRoleArn: "arn:aws:iam::123456789012:role/admin",
      })
    })
  })
})
