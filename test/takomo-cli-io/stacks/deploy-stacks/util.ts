import {
  DetailedStackParameter,
  StackParameterKey,
  StackParameterNoEcho,
  StackParameterValue,
} from "../../../../src/aws/cloudformation/model"
import { Tag, TagKey, TagValue } from "../../../../src/aws/common/model"
import {
  ParameterOperation,
  ParameterSpec,
} from "../../../../src/takomo-cli-io/stacks/deploy-stacks/parameters"
import {
  TagOperation,
  TagSpec,
} from "../../../../src/takomo-cli-io/stacks/deploy-stacks/tags"

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
