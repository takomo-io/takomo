import {
  StackCapability,
  StackPolicyBody,
} from "../aws/cloudformation/model.js"
import { AccountId, Region, TagKey } from "../aws/common/model.js"
import { TemplateBucketConfig, TimeoutConfig, Vars } from "../common/model.js"
import { HookConfig } from "../hooks/hook.js"
import { RawTagValue } from "../stacks/stack.js"
import { CommandRole, Project } from "../takomo-core/command.js"
import { SchemasConfig } from "./common-config.js"

export interface StackGroupConfig {
  readonly project?: Project
  readonly regions: ReadonlyArray<Region>
  readonly accountIds?: ReadonlyArray<AccountId>
  readonly commandRole?: CommandRole
  readonly templateBucket?: TemplateBucketConfig
  readonly tags: Map<TagKey, RawTagValue>
  readonly inheritTags: boolean
  readonly timeout?: TimeoutConfig
  readonly hooks: ReadonlyArray<HookConfig>
  readonly data: Vars
  readonly ignore?: boolean
  readonly obsolete?: boolean
  readonly terminationProtection?: boolean
  readonly capabilities?: ReadonlyArray<StackCapability>
  readonly stackPolicy?: StackPolicyBody
  readonly stackPolicyDuringUpdate?: StackPolicyBody
  readonly schemas?: SchemasConfig
}
