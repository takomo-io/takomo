import { collectAddedTags } from "../../../../src/cli-io/stacks/deploy-stacks/tags"
import { tag, tagSpec } from "./util"

describe("#collectAddedTags", () => {
  describe("should return correct tags", () => {
    test("when there are no existing or new tags", () => {
      const collected = collectAddedTags([], [])
      expect(collected).toStrictEqual([])
    })

    test("when new tags have the same values as existing tags", () => {
      const newTags = [tag("TagA", "valueA"), tag("TagB", "valueB")]
      const existingTags = [tag("TagA", "valueA"), tag("TagB", "valueB")]

      const collected = collectAddedTags(newTags, existingTags)
      expect(collected).toStrictEqual([])
    })

    test("when new tags do not have the same values as existing tags", () => {
      const newTags = [tag("TagA", "valueX"), tag("TagB", "valueY")]
      const existingTags = [tag("TagA", "valueA"), tag("TagB", "valueB")]

      const collected = collectAddedTags(newTags, existingTags)
      expect(collected).toStrictEqual([])
    })

    test("when all of new tags are not found from the existing tags", () => {
      const newTags = [
        tag("TagC", "valueZ"),
        tag("TagA", "valueX"),
        tag("TagB", "valueY"),
      ]

      const existingTags = [tag("TagA", "valueA"), tag("TagB", "valueB")]

      const collected = collectAddedTags(newTags, existingTags)
      const expected = [tagSpec("TagC", undefined, "valueZ", "create")]
      expect(collected).toStrictEqual(expected)
    })
  })
})
