import {
  StackCapability,
  StackName,
  StackParameterKey,
  StackPolicyBody,
} from "../aws/cloudformation/model.js"
import { AccountId, Region, TagKey } from "../aws/common/model.js"
import { TemplateBucketConfig, TimeoutConfig, Vars } from "../common/model.js"
import { HookConfig } from "../hooks/hook.js"
import { RawTagValue, StackPath } from "../stacks/stack.js"
import { BlueprintPath } from "../stacks/standard-stack.js"
import { CommandRole, Project } from "../takomo-core/command.js"
import {
  ParameterConfigs,
  SchemasConfig,
  TemplateConfig,
} from "./common-config.js"

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
