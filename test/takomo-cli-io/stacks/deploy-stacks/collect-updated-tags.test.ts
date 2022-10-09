import { collectUpdatedTags } from "../../../../src/takomo-cli-io/stacks/deploy-stacks/tags"
import { tag, tagSpec } from "./util"

describe("#collectUpdatedTags", () => {
  describe("should return correct tags", () => {
    test("when there are no existing or new tags", () => {
      const collected = collectUpdatedTags([], [])
      expect(collected).toStrictEqual([])
    })

    test("when new tags have the same values as existing tags", () => {
      const newTags = [tag("TagA", "valueA"), tag("TagB", "valueB")]
      const existingTags = [tag("TagA", "valueA"), tag("TagB", "valueB")]

      const collected = collectUpdatedTags(newTags, existingTags)
      expect(collected).toStrictEqual([])
    })

    test("when new tags do not have the same values as existing tags", () => {
      const newTags = [tag("TagA", "valueX"), tag("TagB", "valueY")]
      const existingTags = [tag("TagA", "valueA"), tag("TagB", "valueB")]

      const collected = collectUpdatedTags(newTags, existingTags)
      const expected = [
        tagSpec("TagA", "valueA", "valueX", "update"),
        tagSpec("TagB", "valueB", "valueY", "update"),
      ]
      expect(collected).toStrictEqual(expected)
    })

    test("when one of the tags is updated", () => {
      const newTags = [tag("TagA", "valueX"), tag("TagB", "valueB")]
      const existingTags = [tag("TagA", "valueA"), tag("TagB", "valueB")]

      const collected = collectUpdatedTags(newTags, existingTags)
      const expected = [tagSpec("TagA", "valueA", "valueX", "update")]
      expect(collected).toStrictEqual(expected)
    })
  })
})
