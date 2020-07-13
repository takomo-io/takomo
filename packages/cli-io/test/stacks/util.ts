import { CloudFormation } from "aws-sdk"
import {
  ParameterOperation,
  ParameterSpec,
} from "../../src/stacks/deploy-stacks-io"

export const param = (
  ParameterKey: string,
  ParameterValue: string,
): CloudFormation.Parameter => ({
  ParameterKey,
  ParameterValue,
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
  currentValue: string | null,
  newValue: string | null,
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
