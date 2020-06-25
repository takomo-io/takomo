import { CloudFormation } from "aws-sdk"
import {
  collectAddedParameters,
  ParameterOperation,
} from "../../src/stacks/deploy-stacks-io"
import { param, paramDeclaration, paramSpec } from "./util"

describe("#collectAddedParameters", () => {
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
      const collected = collectAddedParameters(
        newParamsDeclarations,
        newParams,
        existingParamsDeclarations,
        existingParams,
      )
      expect(collected).toStrictEqual([])
    })

    test("when new parameters have the same values as existing parameters", () => {
      const newParamDeclarations = [
        paramDeclaration("ParamA", false),
        paramDeclaration("ParamB", false),
      ]
      const newParams = [param("ParamA", "valueA"), param("ParamB", "valueB")]
      const existingParams = [
        param("ParamA", "valueA"),
        param("ParamB", "valueB"),
      ]
      const existingParamDeclarations = [
        paramDeclaration("ParamA", false),
        paramDeclaration("ParamB", false),
      ]

      const collected = collectAddedParameters(
        newParamDeclarations,
        newParams,
        existingParamDeclarations,
        existingParams,
      )
      expect(collected).toStrictEqual([])
    })

    test("when new parameters do not have the same values as existing parameters", () => {
      const newParamDeclarations = [
        paramDeclaration("ParamA", false),
        paramDeclaration("ParamB", false),
      ]
      const newParams = [param("ParamA", "valueX"), param("ParamB", "valueY")]
      const existingParamDeclarations = [
        paramDeclaration("ParamA", false),
        paramDeclaration("ParamB", false),
      ]
      const existingParams = [
        param("ParamA", "valueA"),
        param("ParamB", "valueB"),
      ]

      const collected = collectAddedParameters(
        newParamDeclarations,
        newParams,
        existingParamDeclarations,
        existingParams,
      )
      expect(collected).toStrictEqual([])
    })

    test("when all of new parameters are not found from the existing parameters", () => {
      const newParamDeclarations = [
        paramDeclaration("ParamA", false),
        paramDeclaration("ParamB", false),
        paramDeclaration("ParamC", false),
      ]

      const newParams = [
        param("ParamA", "valueX"),
        param("ParamB", "valueY"),
        param("ParamC", "valueZ"),
      ]

      const existingParamDeclarations = [
        paramDeclaration("ParamA", false),
        paramDeclaration("ParamB", false),
      ]

      const existingParams = [
        param("ParamA", "valueA"),
        param("ParamB", "valueB"),
      ]

      const collected = collectAddedParameters(
        newParamDeclarations,
        newParams,
        existingParamDeclarations,
        existingParams,
      )
      const expected = [
        paramSpec(
          "ParamC",
          null,
          "valueZ",
          false,
          false,
          ParameterOperation.ADD,
        ),
      ]
      expect(collected).toStrictEqual(expected)
    })
  })
})
