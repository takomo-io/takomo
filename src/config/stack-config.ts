import {
  StackCapability,
  StackName,
  StackParameterKey,
  StackPolicyBody,
} from "../aws/cloudformation/model"
import { AccountId, Region, TagKey } from "../aws/common/model"
import { TemplateBucketConfig, TimeoutConfig, Vars } from "../common/model"
import { HookConfig } from "../hooks/hook"
import { BlueprintPath, RawTagValue, StackPath } from "../stacks/stack"
import { CommandRole, Project } from "../takomo-core/command"
import {
  ParameterConfigs,
  SchemasConfig,
  TemplateConfig,
} from "./common-config"

export interface StackConfig {
  readonly project?: Project
  readonly name?: StackName
  readonly template?: TemplateConfig
  readonly templateBucket?: TemplateBucketConfig
  readonly regions: ReadonlyArray<Region>
  readonly accountIds?: ReadonlyArray<AccountId>
  readonly commandRole?: CommandRole
  readonly timeout?: TimeoutConfig
  readonly depends?: ReadonlyArray<StackPath>
  readonly tags: Map<TagKey, RawTagValue>
  readonly inheritTags?: boolean
  readonly parameters: Map<StackParameterKey, ParameterConfigs>
  readonly data: Vars
  readonly hooks: ReadonlyArray<HookConfig>
  readonly capabilities?: ReadonlyArray<StackCapability>
  readonly ignore?: boolean
  readonly obsolete?: boolean
  readonly terminationProtection?: boolean
  readonly stackPolicy?: StackPolicyBody
  readonly stackPolicyDuringUpdate?: StackPolicyBody
  readonly schemas?: SchemasConfig
  readonly blueprint?: BlueprintPath
}
