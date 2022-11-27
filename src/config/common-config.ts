import { ResolverName } from "../resolvers/resolver"
import { FilePath } from "../utils/files"

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
