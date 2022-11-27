import { TemplateBucketConfig, TimeoutConfig, Vars } from "../common/model"
import { HookConfig } from "../hooks/hook"
import { RawTagValue } from "../stacks/stack"
import {
  AccountId,
  Region,
  StackCapability,
  StackPolicyBody,
  TagKey,
} from "../takomo-aws-model"
import { CommandRole, Project } from "../takomo-core/command"
import { SchemasConfig } from "./common-config"

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
