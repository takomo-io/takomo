import { collectAddedParameters } from "../../../../src/takomo-cli-io/stacks/deploy-stacks/parameters"
import { param, paramSpec } from "./util"

describe("#collectAddedParameters", () => {
  describe("should return correct parameters", () => {
    test("when there are no existing or new parameters", () => {
      const collected = collectAddedParameters([], [])
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

      const collected = collectAddedParameters(newParams, existingParams)
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

      const collected = collectAddedParameters(newParams, existingParams)
      expect(collected).toStrictEqual([])
    })

    test("when all of new parameters are not found from the existing parameters", () => {
      const newParams = [
        param("ParamA", "valueX", false),
        param("ParamB", "valueY", false),
        param("ParamC", "valueZ", false),
      ]

      const existingParams = [
        param("ParamA", "valueA", false),
        param("ParamB", "valueB", false),
      ]

      const collected = collectAddedParameters(newParams, existingParams)
      const expected = [
        paramSpec("ParamC", undefined, "valueZ", false, false, "create"),
      ]
      expect(collected).toStrictEqual(expected)
    })
  })
})
