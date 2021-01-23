import { collectRemovedTags } from "../../../src/stacks/deploy-stacks/tags"
import { tag, tagSpec } from "./util"

describe("#collectRemovedTags", () => {
  describe("should return correct tags", () => {
    test("when there are no existing or new tags", () => {
      const collected = collectRemovedTags([], [])
      expect(collected).toStrictEqual([])
    })

    test("when new tags does not contain all existing tags", () => {
      const newTags = [tag("TagA", "valueA")]
      const existingTags = [tag("TagA", "valueA"), tag("TagB", "valueB")]
      const collected = collectRemovedTags(newTags, existingTags)
      const expected = [tagSpec("TagB", "valueB", undefined, "delete")]
      expect(collected).toStrictEqual(expected)
    })

    test("when new tags contain all existing tags", () => {
      const newTags = [tag("TagA", "valueA"), tag("TagB", "valueB")]
      const existingTags = [tag("TagA", "valueA"), tag("TagB", "valueB")]
      const collected = collectRemovedTags(newTags, existingTags)
      expect(collected).toStrictEqual([])
    })
  })
})
