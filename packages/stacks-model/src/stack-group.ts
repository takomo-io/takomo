import {
  AccountId,
  Region,
  StackCapability,
  StackPolicyBody,
  TagKey,
  TagValue,
} from "@takomo/aws-model"
import { CommandRole, Project, Vars } from "@takomo/core"
import { TemplateBucketConfig, TimeoutConfig } from "./common"
import { HookConfig } from "./hook"
import { Schemas } from "./schemas"
import { InternalStack } from "./stack"

export type StackGroupPath = string
export type StackGroupName = string

/**
 * @hidden
 */
export interface StackGroupProps {
  name: StackGroupName
  project?: Project
  regions: ReadonlyArray<Region>
  accountIds: ReadonlyArray<AccountId>
  commandRole?: CommandRole
  path: StackGroupPath
  parentPath?: StackGroupPath
  templateBucket?: TemplateBucketConfig
  children: ReadonlyArray<StackGroup>
  stacks: ReadonlyArray<InternalStack>
  timeout?: TimeoutConfig
  tags: Map<TagKey, TagValue>
  hooks: ReadonlyArray<HookConfig>
  data: Vars
  capabilities?: ReadonlyArray<StackCapability>
  ignore: boolean
  terminationProtection: boolean
  stackPolicy?: StackPolicyBody
  stackPolicyDuringUpdate?: StackPolicyBody
  schemas?: Schemas
}

/**
 * @hidden
 */
export interface StackGroup {
  readonly name: string
  readonly project?: Project
  readonly regions: ReadonlyArray<Region>
  readonly accountIds: ReadonlyArray<AccountId>
  readonly commandRole?: CommandRole
  readonly path: StackGroupPath
  readonly parentPath?: StackGroupPath
  readonly root: boolean
  readonly templateBucket?: TemplateBucketConfig
  readonly children: ReadonlyArray<StackGroup>
  readonly stacks: ReadonlyArray<InternalStack>
  readonly timeout?: TimeoutConfig
  readonly tags: Map<TagKey, TagValue>
  readonly hooks: ReadonlyArray<HookConfig>
  readonly data: Record<string, unknown>
  readonly capabilities?: ReadonlyArray<StackCapability>
  readonly ignore: boolean
  readonly terminationProtection: boolean
  readonly stackPolicy?: StackPolicyBody
  readonly stackPolicyDuringUpdate?: StackPolicyBody
  readonly toProps: () => StackGroupProps
  readonly schemas?: Schemas
}

/**
 * @hidden
 */
export const createStackGroup = (props: StackGroupProps): StackGroup => {
  const {
    accountIds,
    capabilities,
    children,
    commandRole,
    data,
    hooks,
    ignore,
    name,
    parentPath,
    path,
    project,
    regions,
    stacks,
    tags,
    templateBucket,
    terminationProtection,
    timeout,
    stackPolicy,
    stackPolicyDuringUpdate,
    schemas,
  } = props

  return {
    accountIds,
    capabilities,
    children,
    commandRole,
    data,
    hooks,
    ignore,
    name,
    parentPath,
    path,
    project,
    regions,
    stacks,
    tags,
    templateBucket,
    terminationProtection,
    timeout,
    stackPolicy,
    stackPolicyDuringUpdate,
    schemas,
    root: parentPath === undefined,
    toProps: () => props,
  }
}
