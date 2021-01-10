import {
  collectRemovedParameters,
  ParameterOperation,
} from "../../src/stacks/deploy-stacks-io"
import { param, paramSpec } from "./util"

describe("#collectRemovedParameters", () => {
  describe("should return correct parameters", () => {
    test("when there are no existing or new parameters", () => {
      const collected = collectRemovedParameters([], [])
      expect(collected).toStrictEqual([])
    })

    test("when new parameters does not contain all existing parameters", () => {
      const newParams = [param("ParamA", "valueA", false)]
      const existingParams = [
        param("ParamA", "valueA", false),
        param("ParamB", "valueB", false),
      ]
      const collected = collectRemovedParameters(newParams, existingParams)
      const expected = [
        paramSpec(
          "ParamB",
          "valueB",
          undefined,
          false,
          false,
          ParameterOperation.DELETE,
        ),
      ]
      expect(collected).toStrictEqual(expected)
    })

    test("when new parameters contain all existing parameters", () => {
      const newParams = [
        param("ParamA", "valueA", false),
        param("ParamB", "valueB", false),
      ]
      const existingParams = [
        param("ParamA", "valueA", false),
        param("ParamB", "valueB", false),
      ]
      const collected = collectRemovedParameters(newParams, existingParams)
      expect(collected).toStrictEqual([])
    })
  })
})
