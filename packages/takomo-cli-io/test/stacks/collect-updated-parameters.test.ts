import { CloudFormation } from "aws-sdk"
import {
  collectUpdatedParameters,
  ParameterOperation,
} from "../../src/stacks/deploy-stacks-io"
import { param, paramDeclaration, paramSpec } from "./util"

describe("#collectUpdatedParameters", () => {
  describe("should return correct parameters", () => {
    test("when there are no existing or new parameters", () => {
      const newParams = new Array<CloudFormation.Parameter>()
      const newParamsDeclarations = new Array<
        CloudFormation.ParameterDeclaration
      >()
      const existingParams = new Array<CloudFormation.Parameter>()
      const existingParamsDeclarations = new Array<
        CloudFormation.ParameterDeclaration
      >()
      const collected = collectUpdatedParameters(
        newParamsDeclarations,
        newParams,
        existingParamsDeclarations,
        existingParams,
      )
      expect(collected).toStrictEqual([])
    })

    test("when new parameters have the same values as existing parameters", () => {
      const newParamsDeclarations = [
        paramDeclaration("ParamA", false),
        paramDeclaration("ParamB", false),
      ]
      const newParams = [param("ParamA", "valueA"), param("ParamB", "valueB")]
      const existingParamsDeclarations = [
        paramDeclaration("ParamA", false),
        paramDeclaration("ParamB", false),
      ]
      const existingParams = [
        param("ParamA", "valueA"),
        param("ParamB", "valueB"),
      ]

      const collected = collectUpdatedParameters(
        newParamsDeclarations,
        newParams,
        existingParamsDeclarations,
        existingParams,
      )
      expect(collected).toStrictEqual([])
    })

    test("when new parameters do not have the same values as existing parameters", () => {
      const newParamsDeclarations = [
        paramDeclaration("ParamA", false),
        paramDeclaration("ParamB", false),
      ]
      const newParams = [param("ParamA", "valueX"), param("ParamB", "valueY")]
      const existingParamsDeclarations = [
        paramDeclaration("ParamA", false),
        paramDeclaration("ParamB", false),
      ]
      const existingParams = [
        param("ParamA", "valueA"),
        param("ParamB", "valueB"),
      ]

      const collected = collectUpdatedParameters(
        newParamsDeclarations,
        newParams,
        existingParamsDeclarations,
        existingParams,
      )
      const expected = [
        paramSpec(
          "ParamA",
          "valueA",
          "valueX",
          false,
          false,
          ParameterOperation.UPDATE,
        ),
        paramSpec(
          "ParamB",
          "valueB",
          "valueY",
          false,
          false,
          ParameterOperation.UPDATE,
        ),
      ]
      expect(collected).toStrictEqual(expected)
    })

    test("when one of the parameters is updated", () => {
      const newParamsDeclarations = [
        paramDeclaration("ParamA", false),
        paramDeclaration("ParamB", false),
      ]
      const newParams = [param("ParamA", "valueX"), param("ParamB", "valueB")]
      const existingParamsDeclarations = [
        paramDeclaration("ParamA", false),
        paramDeclaration("ParamB", false),
      ]
      const existingParams = [
        param("ParamA", "valueA"),
        param("ParamB", "valueB"),
      ]

      const collected = collectUpdatedParameters(
        newParamsDeclarations,
        newParams,
        existingParamsDeclarations,
        existingParams,
      )
      const expected = [
        paramSpec(
          "ParamA",
          "valueA",
          "valueX",
          false,
          false,
          ParameterOperation.UPDATE,
        ),
      ]
      expect(collected).toStrictEqual(expected)
    })
  })
})
