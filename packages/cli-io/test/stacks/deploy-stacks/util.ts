import {
  DetailedStackParameter,
  StackParameterKey,
  StackParameterNoEcho,
  StackParameterValue,
  Tag,
  TagKey,
  TagValue,
} from "@takomo/aws-model"
import { TagOperation, TagSpec } from "../../../dist/stacks/deploy-stacks-io"
import {
  ParameterOperation,
  ParameterSpec,
} from "../../../src/stacks/deploy-stacks/parameters"

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

export const paramSpec = (
  key: StackParameterKey,
  currentValue: StackParameterValue | undefined,
  newValue: StackParameterValue | undefined,
  newNoEcho: StackParameterNoEcho,
  currentNoEcho: StackParameterNoEcho,
  operation: ParameterOperation,
): ParameterSpec => ({
  key,
  currentValue,
  newValue,
  currentNoEcho,
  newNoEcho,
  operation,
})

export const tag = (key: TagKey, value: TagValue): Tag => ({ key, value })

export const tagSpec = (
  key: TagKey,
  currentValue: TagValue | undefined,
  newValue: TagValue | undefined,
  operation: TagOperation,
): TagSpec => ({
  key,
  currentValue,
  newValue,
  operation,
})
