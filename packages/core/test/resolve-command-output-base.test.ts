import { CommandOutputBase, resolveCommandOutputBase } from "../src/command"

const successful: CommandOutputBase = {
  success: true,
  status: "SUCCESS",
  message: "Success",
}

const failed: CommandOutputBase = {
  success: false,
  status: "FAILED",
  message: "Failed",
}

describe("#resolveCommandOutputBase", () => {
  describe("should return correct results", () => {
    it("when an empty list is given", () => {
      const res = resolveCommandOutputBase([])
      expect(res).toStrictEqual(successful)
    })
    it("when a single successful item is given", () => {
      const res = resolveCommandOutputBase([successful])
      expect(res).toStrictEqual(successful)
    })
    it("when a single unsuccessful item is given", () => {
      const res = resolveCommandOutputBase([failed])
      expect(res).toStrictEqual(failed)
    })
    it("when a list of items contains at least one unsuccessful item", () => {
      const res = resolveCommandOutputBase([successful, failed, successful])
      expect(res).toStrictEqual(failed)
    })
    it("when a all items in a list are successful", () => {
      const res = resolveCommandOutputBase([successful, successful, successful])
      expect(res).toStrictEqual(successful)
    })
  })
})
