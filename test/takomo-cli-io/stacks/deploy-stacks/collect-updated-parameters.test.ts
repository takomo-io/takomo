import { collectUpdatedParameters } from "../../../../src/takomo-cli-io/stacks/deploy-stacks/parameters"
import { param, paramSpec } from "./util"

describe("#collectUpdatedParameters", () => {
  describe("should return correct parameters", () => {
    test("when there are no existing or new parameters", () => {
      const collected = collectUpdatedParameters([], [])
      expect(collected).toStrictEqual([])
    })

    test("when new parameters have the same values as existing parameters", () => {
      const newParams = [
        param("ParamA", "valueA", false),
        param("ParamB", "valueB", false),
      ]
      const existingParams = [
        param("ParamA", "valueA", false),
        param("ParamB", "valueB", false),
      ]

      const collected = collectUpdatedParameters(newParams, existingParams)
      expect(collected).toStrictEqual([])
    })

    test("when new parameters do not have the same values as existing parameters", () => {
      const newParams = [
        param("ParamA", "valueX", false),
        param("ParamB", "valueY", false),
      ]
      const existingParams = [
        param("ParamA", "valueA", false),
        param("ParamB", "valueB", false),
      ]

      const collected = collectUpdatedParameters(newParams, existingParams)
      const expected = [
        paramSpec("ParamA", "valueA", "valueX", false, false, "update"),
        paramSpec("ParamB", "valueB", "valueY", false, false, "update"),
      ]
      expect(collected).toStrictEqual(expected)
    })

    test("when one of the parameters is updated", () => {
      const newParams = [
        param("ParamA", "valueX", false),
        param("ParamB", "valueB", false),
      ]
      const existingParams = [
        param("ParamA", "valueA", false),
        param("ParamB", "valueB", false),
      ]

      const collected = collectUpdatedParameters(newParams, existingParams)
      const expected = [
        paramSpec("ParamA", "valueA", "valueX", false, false, "update"),
      ]
      expect(collected).toStrictEqual(expected)
    })
  })
})
