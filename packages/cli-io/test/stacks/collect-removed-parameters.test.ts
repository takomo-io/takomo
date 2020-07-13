import { CloudFormation } from "aws-sdk"
import {
  collectRemovedParameters,
  ParameterOperation,
} from "../../src/stacks/deploy-stacks-io"
import { param, paramDeclaration, paramSpec } from "./util"

describe("#collectRemovedParameters", () => {
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
      const collected = collectRemovedParameters(
        newParamsDeclarations,
        newParams,
        existingParamsDeclarations,
        existingParams,
      )
      expect(collected).toStrictEqual([])
    })

    test("when new parameters does not contain all existing parameters", () => {
      const newParamsDeclarations = [paramDeclaration("ParamA", false)]
      const newParams = [param("ParamA", "valueA")]
      const existingParamsDeclarations = [
        paramDeclaration("ParamA", false),
        paramDeclaration("ParamB", false),
      ]
      const existingParams = [
        param("ParamA", "valueA"),
        param("ParamB", "valueB"),
      ]
      const collected = collectRemovedParameters(
        newParamsDeclarations,
        newParams,
        existingParamsDeclarations,
        existingParams,
      )
      const expected = [
        paramSpec(
          "ParamB",
          "valueB",
          null,
          false,
          false,
          ParameterOperation.DELETE,
        ),
      ]
      expect(collected).toStrictEqual(expected)
    })

    test("when new parameters contain all existing parameters", () => {
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
      const collected = collectRemovedParameters(
        newParamsDeclarations,
        newParams,
        existingParamsDeclarations,
        existingParams,
      )
      expect(collected).toStrictEqual([])
    })
  })
})
