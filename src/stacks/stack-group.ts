import {
  StackCapability,
  StackPolicyBody,
} from "../aws/cloudformation/model.js"
import { AccountId, Region, TagKey } from "../aws/common/model.js"
import { TemplateBucketConfig, TimeoutConfig, Vars } from "../common/model.js"
import { HookConfig } from "../hooks/hook.js"
import { CommandRole, Project } from "../takomo-core/command.js"
import { Schemas } from "../takomo-stacks-model/schemas.js"
import { InternalStack, RawTagValue } from "./stack.js"

export type StackGroupPath = string
export type StackGroupName = string

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
  tags: Map<TagKey, RawTagValue>
  hooks: ReadonlyArray<HookConfig>
  data: Vars
  capabilities?: ReadonlyArray<StackCapability>
  ignore: boolean
  obsolete: boolean
  terminationProtection: boolean
  stackPolicy?: StackPolicyBody
  stackPolicyDuringUpdate?: StackPolicyBody
  schemas?: Schemas
}

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
  readonly tags: Map<TagKey, RawTagValue>
  readonly hooks: ReadonlyArray<HookConfig>
  readonly data: Record<string, unknown>
  readonly capabilities?: ReadonlyArray<StackCapability>
  readonly ignore: boolean
  readonly obsolete: boolean
  readonly terminationProtection: boolean
  readonly stackPolicy?: StackPolicyBody
  readonly stackPolicyDuringUpdate?: StackPolicyBody
  readonly toProps: () => StackGroupProps
  readonly schemas?: Schemas
}

export const createStackGroup = (props: StackGroupProps): StackGroup => {
  const {
    accountIds,
    capabilities,
    children,
    commandRole,
    data,
    hooks,
    ignore,
    obsolete,
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
    obsolete,
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
