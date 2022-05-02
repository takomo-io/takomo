import {
  AccountId,
  Region,
  StackCapability,
  StackName,
  StackParameterKey,
  StackPolicyBody,
  TagKey,
} from "@takomo/aws-model"
import { CommandRole, Project, Vars } from "@takomo/core"
import {
  HookConfig,
  RawTagValue,
  ResolverName,
  StackPath,
  TemplateBucketConfig,
  TimeoutConfig,
} from "@takomo/stacks-model"
import { FilePath } from "@takomo/util"

export interface SchemaConfig {
  readonly name: string
  readonly [key: string]: unknown
}

export interface SchemasConfig {
  readonly data: ReadonlyArray<SchemaConfig>
  readonly tags: ReadonlyArray<SchemaConfig>
  readonly name: ReadonlyArray<SchemaConfig>
  readonly parameters: ReadonlyArray<SchemaConfig>
}

export interface ParameterConfig {
  readonly resolver: ResolverName
  readonly confidential?: boolean
  readonly immutable: boolean
  readonly schema?: SchemaConfig
  readonly [key: string]: unknown
}

export class SingleParameterConfig {
  readonly config: ParameterConfig
  readonly isList = false
  constructor(config: ParameterConfig) {
    this.config = config
  }
}

interface ListParameterConfigProps {
  readonly items: ReadonlyArray<ParameterConfig>
  readonly confidential?: boolean
  readonly immutable?: boolean
  readonly schema?: SchemaConfig
}

export class ListParameterConfig {
  readonly confidential?: boolean
  readonly immutable: boolean
  readonly items: ReadonlyArray<ParameterConfig>
  readonly isList = true
  readonly schema?: SchemaConfig

  constructor({
    items,
    immutable,
    confidential,
    schema,
  }: ListParameterConfigProps) {
    this.items = items
    this.immutable = immutable ?? false
    this.confidential = confidential
    this.schema = schema
  }
}

export type ParameterConfigs = SingleParameterConfig | ListParameterConfig

export interface TemplateConfig {
  readonly dynamic: boolean
  readonly filename?: FilePath
  readonly inline?: string
}

export interface StackConfig {
  readonly project?: Project
  readonly name?: StackName
  readonly template: TemplateConfig
  readonly templateBucket?: TemplateBucketConfig
  readonly regions: ReadonlyArray<Region>
  readonly accountIds?: ReadonlyArray<AccountId>
  readonly commandRole?: CommandRole
  readonly timeout?: TimeoutConfig
  readonly depends: ReadonlyArray<StackPath>
  readonly tags: Map<TagKey, RawTagValue>
  readonly inheritTags: boolean
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
}

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
