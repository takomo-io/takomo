import { AnySchema } from "joi"
import R from "ramda"
import { CredentialManager } from "../../takomo-aws-clients"
import {
  AccountId,
  IamRoleArn,
  Region,
  StackCapability,
  StackName,
  StackPolicyBody,
  TagKey,
} from "../../takomo-aws-model"
import { createAwsSchemas } from "../../takomo-aws-schema"
import { CommandContext, CommandRole, Project, Vars } from "../../takomo-core"
import { StackConfig, TemplateConfig } from "../../takomo-stacks-config"
import { HookRegistry } from "../../takomo-stacks-hooks"
import {
  CommandPath,
  createStack,
  HookConfig,
  InternalStack,
  isWithinCommandPath,
  normalizeStackPath,
  RawTagValue,
  SchemaRegistry,
  StackGroup,
  StackPath,
  StackPropertyDefaults,
  StackProps,
  Template,
  TemplateBucketConfig,
  TimeoutConfig,
} from "../../takomo-stacks-model"
import { ResolverRegistry } from "../../takomo-stacks-resolvers"
import {
  mapToObject,
  merge,
  mergeArrays,
  mergeMaps,
  TakomoError,
  TkmLogger,
  validate,
} from "../../takomo-util"
import { StacksConfigRepository } from "../model"
import { StackConfigNode } from "./config-tree"
import { createVariablesForStackConfigFile } from "./create-variables-for-stack-config-file"
import { getCredentialManager } from "./get-credential-provider"
import { initializeHooks } from "./hooks"
import { makeStackName } from "./make-stack-name"
import { mergeStackSchemas } from "./merge-stack-schemas"
import { buildParameters } from "./parameters"
import { ProcessStatus } from "./process-config-tree"

export interface StackPropBuilderProps {
  readonly stackConfig: StackConfig
  readonly stackGroup: StackGroup
  readonly blueprint?: StackConfig
}

const buildTemplateInternal = (
  stackPath: StackPath,
  { inline, filename, dynamic }: TemplateConfig,
): Template => {
  if (inline) {
    return {
      dynamic,
      inline,
    }
  }

  return {
    dynamic,
    filename: filename ?? stackPath.slice(1),
  }
}

export const buildTemplate = (
  { stackConfig, blueprint }: StackPropBuilderProps,
  stackPath: StackPath,
): Template => {
  if (stackConfig.template) {
    return buildTemplateInternal(stackPath, stackConfig.template)
  }

  if (blueprint?.template) {
    return buildTemplateInternal(stackPath, blueprint.template)
  }

  return {
    dynamic: true,
    filename: stackPath.slice(1),
  }
}

const validateData = (
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

const validateTags = (
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

const validateName = (
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

export const buildCapabilities = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): ReadonlyArray<StackCapability> | undefined =>
  stackConfig.capabilities ?? blueprint?.capabilities ?? stackGroup.capabilities

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

export const buildStackPolicy = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): StackPolicyBody | undefined =>
  stackConfig.stackPolicy ?? blueprint?.stackPolicy ?? stackGroup.stackPolicy

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

export const buildTemplateBucket = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): TemplateBucketConfig | undefined =>
  stackConfig.templateBucket ??
  blueprint?.templateBucket ??
  stackGroup.templateBucket ??
  StackPropertyDefaults.templateBucket()

export const buildDependencies = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): ReadonlyArray<StackPath> => {
  const depends =
    stackConfig.depends ?? blueprint?.depends ?? StackPropertyDefaults.depends()
  return depends.map((d) => normalizeStackPath(stackGroup.path, d))
}

export const buildStackPolicyDuringUpdate = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StackPropBuilderProps): StackPolicyBody | undefined =>
  stackConfig.stackPolicyDuringUpdate ??
  blueprint?.stackPolicyDuringUpdate ??
  stackGroup.stackPolicyDuringUpdate

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
  ctx: CommandContext,
  logger: TkmLogger,
  defaultCredentialManager: CredentialManager,
  credentialManagers: Map<IamRoleArn, CredentialManager>,
  resolverRegistry: ResolverRegistry,
  schemaRegistry: SchemaRegistry,
  hookRegistry: HookRegistry,
  node: StackConfigNode,
  stackGroup: StackGroup,
  commandPath: CommandPath,
  status: ProcessStatus,
  configRepository: StacksConfigRepository,
): Promise<InternalStack[]> => {
  const { stackName } = createAwsSchemas({ regions: ctx.regions })

  logger.debug(`Build stack with path '${node.path}'`)

  const stackPath = node.path
  const stackVariables = createVariablesForStackConfigFile(
    ctx.variables,
    stackGroup,
    stackPath,
  )

  const stackConfig = await node.getConfig(stackVariables)
  const blueprint = stackConfig.blueprint
    ? await configRepository.getBlueprint(stackConfig.blueprint, stackVariables)
    : undefined

  const builderProps: StackPropBuilderProps = {
    stackConfig,
    blueprint,
    stackGroup,
  }

  const hookConfigs = buildHookConfigs(builderProps)
  const name = buildStackName(builderProps, stackPath)
  const regions = buildRegions(builderProps)
  const commandRole = buildCommandRole(builderProps)
  const template = buildTemplate(builderProps, stackPath)
  const accountIds = buildAccountIds(builderProps)
  const capabilities = buildCapabilities(builderProps)
  const ignore = buildIgnore(builderProps)
  const obsolete = buildObsolete(builderProps)
  const terminationProtection = buildTerminationProtection(builderProps)
  const stackPolicy = buildStackPolicy(builderProps)
  const stackPolicyDuringUpdate = buildStackPolicyDuringUpdate(builderProps)
  const project = buildProject(builderProps)

  const parameters = await buildParameters(
    ctx,
    stackPath,
    mergeMaps(blueprint?.parameters ?? new Map(), stackConfig.parameters),
    resolverRegistry,
    schemaRegistry,
  )

  if (regions.length === 0) {
    throw new TakomoError(`Stack ${stackPath} has no regions`)
  }

  validate(stackName, name, `Name of stack ${stackPath} is not valid`)

  R.uniq(
    Array.from(parameters.values())
      .reduce((collected, parameter) => {
        return [...collected, parameter.getIamRoleArns()]
      }, new Array<string[]>())
      .flat(),
  )
    .map((iamRoleArn) => ({ iamRoleArn }))
    .forEach((commandRole) => {
      getCredentialManager(
        commandRole,
        defaultCredentialManager,
        credentialManagers,
      )
    })

  const hooks = await initializeHooks(hookConfigs, hookRegistry)

  const credentialManager = await getCredentialManager(
    commandRole,
    defaultCredentialManager,
    credentialManagers,
  )

  const credentials = await credentialManager.getCredentials()
  const identity = await credentialManager.getCallerIdentity()

  return await Promise.all(
    regions
      .filter((region) =>
        isWithinCommandPath(commandPath, `${stackPath}/${region}`),
      )
      .filter((region) => !status.isStackProcessed(`${stackPath}/${region}`))
      .map(async (region) => {
        const exactPath = `${stackPath}/${region}`
        const stackLogger = logger.childLogger(exactPath)
        const cloudFormationClient =
          await ctx.awsClientProvider.createCloudFormationClient({
            credentialProvider: credentialManager.getCredentialProvider(),
            region,
            identity,
            id: exactPath,
            logger: stackLogger,
          })

        const schemas = await mergeStackSchemas(
          ctx,
          schemaRegistry,
          exactPath,
          stackGroup.schemas,
          stackConfig.schemas,
          blueprint?.schemas,
        )

        const tags = buildTags(builderProps)
        const data = buildData(builderProps)
        const timeout = buildTimeout(builderProps)
        const templateBucket = buildTemplateBucket(builderProps)
        const dependencies = buildDependencies(builderProps)

        const props: StackProps = {
          name,
          template,
          region,
          parameters,
          commandRole,
          credentialManager,
          credentials,
          hooks,
          ignore,
          obsolete,
          terminationProtection,
          capabilities,
          accountIds,
          cloudFormationClient,
          stackPolicy,
          stackPolicyDuringUpdate,
          path: exactPath,
          stackGroupPath: stackGroup.path,
          project,
          tags,
          timeout,
          dependencies,
          dependents: [],
          templateBucket,
          data,
          logger: stackLogger,
          schemas,
        }

        validateData(exactPath, schemas?.data ?? [], props.data)
        validateTags(exactPath, schemas?.tags ?? [], props.tags)
        validateName(exactPath, schemas?.name ?? [], name)

        return createStack(props)
      }),
  )
}
