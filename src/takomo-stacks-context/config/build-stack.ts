import { AnySchema } from "joi"
import { StackName } from "../../aws/cloudformation/model.js"
import { InternalCredentialManager } from "../../aws/common/credentials.js"
import {
  AccountId,
  IamRoleArn,
  Region,
  TagKey,
} from "../../aws/common/model.js"
import { CommandPath } from "../../command/command-model.js"
import { TimeoutConfig, Vars } from "../../common/model.js"
import { StackConfig } from "../../config/stack-config.js"
import { InternalCommandContext } from "../../context/command-context.js"
import { HookRegistry } from "../../hooks/hook-registry.js"
import { HookConfig } from "../../hooks/hook.js"
import { ResolverRegistry } from "../../resolvers/resolver-registry.js"
import { StackGroup } from "../../stacks/stack-group.js"
import { CommandRole, Project } from "../../takomo-core/command.js"
import { StackPropertyDefaults } from "../../takomo-stacks-model/constants.js"
import { SchemaRegistry } from "../../takomo-stacks-model/schemas.js"
import { mapToObject, mergeArrays, mergeMaps } from "../../utils/collections.js"
import { TakomoError } from "../../utils/errors.js"
import { TkmLogger } from "../../utils/logging.js"
import { merge } from "../../utils/objects.js"
import { StacksConfigRepository } from "../model.js"
import { StackConfigNode } from "./config-tree.js"
import { createVariablesForStackConfigFile } from "./create-variables-for-stack-config-file.js"
import { makeStackName } from "./make-stack-name.js"
import { ProcessStatus } from "./process-config-tree.js"
import {
  InternalStack,
  normalizeStackPath,
  RawTagValue,
  StackPath,
} from "../../stacks/stack.js"
import { isStandardStackConfig } from "../../config/standard-stack-config.js"
import { buildStandardStack } from "./build-standard-stack.js"
import { isCustomStackConfig } from "../../config/custom-stack-config.js"
import { buildCustomStack } from "./build-custom-stack.js"
import { CustomStackHandlerRegistry } from "../../custom-stack-handler/custom-stack-handler-registry.js"

export interface StackPropBuilderProps {
  readonly stackConfig: StackConfig
  readonly stackGroup: StackGroup
  readonly blueprint?: StackConfig
}

export const validateData = (
  stackPath: StackPath,
  schemas: ReadonlyArray<AnySchema>,
  data: Vars,
): void => {
  schemas.forEach((schema) => {
    const { error } = schema.validate(data, {
      abortEarly: false,
      convert: false,
    })
    if (error) {
      const details = error.details.map((d) => `  - ${d.message}`).join("\n")
      throw new TakomoError(
        `Validation errors in data configuration of stack ${stackPath}:\n\n${details}`,
      )
    }
  })
}

export const validateTags = (
  stackPath: StackPath,
  schemas: ReadonlyArray<AnySchema>,
  tags: Map<string, RawTagValue>,
): void => {
  schemas.forEach((schema) => {
    const tagsObject = mapToObject(tags)
    const { error } = schema.validate(tagsObject, {
      abortEarly: false,
      convert: false,
    })
    if (error) {
      const details = error.details.map((d) => `  - ${d.message}`).join("\n")
      throw new TakomoError(
        `Validation errors in tags configuration of stack ${stackPath}:\n\n${details}`,
      )
    }
  })
}

export const validateName = (
  stackPath: StackPath,
  schemas: ReadonlyArray<AnySchema>,
  name: StackName,
): void => {
  schemas.forEach((schema) => {
    const { error } = schema
      .label("name")
      .validate(name, { abortEarly: false, convert: false })
    if (error) {
      const details = error.details.map((d) => `  - ${d.message}`).join("\n")
      throw new TakomoError(
        `Validation errors in name of stack ${stackPath}:\n\n${details}`,
      )
    }
  })
}

export const buildStackName = (
  { stackConfig, blueprint, stackGroup }: StackPropBuilderProps,
  stackPath: StackPath,
): string =>
  stackConfig.name ??
  blueprint?.name ??
  makeStackName(
    stackPath,
    stackConfig.project ?? blueprint?.project ?? stackGroup.project,
  )

export const buildRegions = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): ReadonlyArray<Region> => {
  if (stackConfig.regions.length > 0) {
    return stackConfig.regions
  }

  if (blueprint && blueprint.regions.length > 0) {
    return blueprint.regions
  }

  return stackGroup.regions
}

export const buildAccountIds = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): ReadonlyArray<AccountId> =>
  stackConfig.accountIds ?? blueprint?.accountIds ?? stackGroup.accountIds

export const buildCommandRole = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): CommandRole | undefined =>
  stackConfig.commandRole ?? blueprint?.commandRole ?? stackGroup.commandRole

export const buildIgnore = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): boolean =>
  stackConfig.ignore ?? blueprint?.ignore ?? stackGroup.ignore

export const buildObsolete = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): boolean =>
  stackConfig.obsolete ?? blueprint?.obsolete ?? stackGroup.obsolete

export const buildTerminationProtection = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): boolean =>
  stackConfig.terminationProtection ??
  blueprint?.terminationProtection ??
  stackGroup.terminationProtection

export const buildProject = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): Project | undefined =>
  stackConfig.project ?? blueprint?.project ?? stackGroup.project

export const buildTimeout = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): TimeoutConfig =>
  stackConfig.timeout ??
  blueprint?.timeout ??
  stackGroup.timeout ??
  StackPropertyDefaults.timeout()

export const buildDependencies = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): ReadonlyArray<StackPath> => {
  const depends =
    stackConfig.depends ?? blueprint?.depends ?? StackPropertyDefaults.depends()
  return depends.map((d) => normalizeStackPath(stackGroup.path, d))
}

export const buildData = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): Record<string, unknown> =>
  merge(stackGroup.data, blueprint?.data ?? {}, stackConfig.data)

export const buildTags = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): Map<TagKey, RawTagValue> => {
  const inheritTags =
    stackConfig.inheritTags ??
    blueprint?.inheritTags ??
    StackPropertyDefaults.inheritTags()

  const inheritedTags = inheritTags ? new Map(stackGroup.tags) : new Map()

  return mergeMaps(
    inheritedTags,
    blueprint?.tags ?? new Map(),
    stackConfig.tags,
  )
}

export const buildHookConfigs = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): ReadonlyArray<HookConfig> => {
  const baseHooks = mergeArrays({
    first: stackGroup.hooks,
    second: blueprint?.hooks ?? [],
    allowDuplicates: false,
    equals: (a, b) => a.name === b.name,
  })

  return mergeArrays({
    first: baseHooks,
    second: stackConfig.hooks,
    allowDuplicates: false,
    equals: (a, b) => a.name === b.name,
  })
}

export const buildStack = async (
  ctx: InternalCommandContext,
  logger: TkmLogger,
  defaultCredentialManager: InternalCredentialManager,
  credentialManagers: Map<IamRoleArn, InternalCredentialManager>,
  resolverRegistry: ResolverRegistry,
  schemaRegistry: SchemaRegistry,
  hookRegistry: HookRegistry,
  node: StackConfigNode,
  stackGroup: StackGroup,
  commandPath: CommandPath,
  status: ProcessStatus,
  configRepository: StacksConfigRepository,
  customStackHandlerRegistry: CustomStackHandlerRegistry,
): Promise<InternalStack[]> => {
  const stackPath = node.path

  logger.debug(`Build stack with path '${stackPath}'`)

  const stackVariables = createVariablesForStackConfigFile(
    ctx.variables,
    stackGroup,
    stackPath,
  )

  const stackConfig = await node.getConfig(stackVariables)
  if (isStandardStackConfig(stackConfig)) {
    return buildStandardStack(
      stackPath,
      ctx,
      logger,
      defaultCredentialManager,
      credentialManagers,
      resolverRegistry,
      schemaRegistry,
      hookRegistry,
      stackConfig,
      stackGroup,
      commandPath,
      status,
      configRepository,
    )
  }

  if (isCustomStackConfig(stackConfig)) {
    const customStackHandler = customStackHandlerRegistry.getHandler(
      stackConfig.type,
    )

    return buildCustomStack(
      stackPath,
      ctx,
      logger,
      defaultCredentialManager,
      credentialManagers,
      resolverRegistry,
      schemaRegistry,
      hookRegistry,
      stackConfig,
      stackGroup,
      commandPath,
      status,
      customStackHandler,
    )
  }

  throw new TakomoError(
    `Unknown stack config type for stack with path '${stackPath}'`,
  )
}
