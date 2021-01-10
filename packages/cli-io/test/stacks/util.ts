import { DetailedStackParameter } from "@takomo/aws-model"
import { CloudFormation } from "aws-sdk"
import {
  ParameterOperation,
  ParameterSpec,
} from "../../src/stacks/deploy-stacks-io"

export const param = (
  key: string,
  value: string,
  noEcho: boolean,
): DetailedStackParameter => ({
  key,
  value,
  noEcho,
  description: "",
})

export const paramDeclaration = (
  ParameterKey: string,
  NoEcho: boolean,
): CloudFormation.ParameterDeclaration => ({
  ParameterKey,
  NoEcho,
})

export const paramSpec = (
  key: string,
  currentValue: string | undefined,
  newValue: string | undefined,
  newNoEcho: boolean,
  currentNoEcho: boolean,
  operation: ParameterOperation,
): ParameterSpec => ({
  key,
  currentValue,
  newValue,
  currentNoEcho,
  newNoEcho,
  operation,
})
