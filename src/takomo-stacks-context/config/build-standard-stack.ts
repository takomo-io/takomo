import * as R from "ramda"
import {
  StackCapability,
  StackPolicyBody,
} from "../../aws/cloudformation/model.js"
import { InternalCredentialManager } from "../../aws/common/credentials.js"
import { IamRoleArn } from "../../aws/common/model.js"
import { CommandPath } from "../../command/command-model.js"
import { TemplateBucketConfig } from "../../common/model.js"
import { TemplateConfig } from "../../config/common-config.js"
import { InternalCommandContext } from "../../context/command-context.js"
import { HookRegistry } from "../../hooks/hook-registry.js"
import { ResolverRegistry } from "../../resolvers/resolver-registry.js"
import { createAwsSchemas } from "../../schema/aws-schema.js"
import { StackGroup } from "../../stacks/stack-group.js"
import {
  createStandardStack,
  InternalStandardStack,
  STANDARD_STACK_TYPE,
  StandardStackProps,
  Template,
} from "../../stacks/standard-stack.js"
import { StackPropertyDefaults } from "../../takomo-stacks-model/constants.js"
import { SchemaRegistry } from "../../takomo-stacks-model/schemas.js"
import { isWithinCommandPath } from "../../takomo-stacks-model/util.js"
import { mergeMaps } from "../../utils/collections.js"
import { TakomoError } from "../../utils/errors.js"
import { TkmLogger } from "../../utils/logging.js"
import { validate } from "../../utils/validation.js"
import { StacksConfigRepository } from "../model.js"
import { createVariablesForStackConfigFile } from "./create-variables-for-stack-config-file.js"
import { getCredentialManager } from "./get-credential-provider.js"
import { initializeHooks } from "./hooks.js"
import { mergeStackSchemas } from "./merge-stack-schemas.js"
import { buildParameters } from "./parameters.js"
import { ProcessStatus } from "./process-config-tree.js"
import { StackPath } from "../../stacks/stack.js"
import { StandardStackConfig } from "../../config/standard-stack-config.js"
import {
  buildAccountIds,
  buildCommandRole,
  buildData,
  buildDependencies,
  buildHookConfigs,
  buildIgnore,
  buildObsolete,
  buildProject,
  buildRegions,
  buildStackName,
  buildTags,
  buildTerminationProtection,
  buildTimeout,
  validateData,
  validateName,
  validateTags,
} from "./build-stack.js"

export interface StandardStackPropBuilderProps {
  readonly stackConfig: StandardStackConfig
  readonly stackGroup: StackGroup
  readonly blueprint?: StandardStackConfig
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
  { stackConfig, blueprint }: StandardStackPropBuilderProps,
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

export const buildCapabilities = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StandardStackPropBuilderProps): ReadonlyArray<StackCapability> | undefined =>
  stackConfig.capabilities ?? blueprint?.capabilities ?? stackGroup.capabilities

export const buildStackPolicy = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StandardStackPropBuilderProps): StackPolicyBody | undefined =>
  stackConfig.stackPolicy ?? blueprint?.stackPolicy ?? stackGroup.stackPolicy

export const buildTemplateBucket = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StandardStackPropBuilderProps): TemplateBucketConfig | undefined =>
  stackConfig.templateBucket ??
  blueprint?.templateBucket ??
  stackGroup.templateBucket ??
  StackPropertyDefaults.templateBucket()

export const buildStackPolicyDuringUpdate = ({
  stackConfig,
  blueprint,
  stackGroup,
}: StandardStackPropBuilderProps): StackPolicyBody | undefined =>
  stackConfig.stackPolicyDuringUpdate ??
  blueprint?.stackPolicyDuringUpdate ??
  stackGroup.stackPolicyDuringUpdate

export const buildStandardStack = async (
  stackPath: StackPath,
  ctx: InternalCommandContext,
  logger: TkmLogger,
  defaultCredentialManager: InternalCredentialManager,
  credentialManagers: Map<IamRoleArn, InternalCredentialManager>,
  resolverRegistry: ResolverRegistry,
  schemaRegistry: SchemaRegistry,
  hookRegistry: HookRegistry,
  stackConfig: StandardStackConfig,
  stackGroup: StackGroup,
  commandPath: CommandPath,
  status: ProcessStatus,
  configRepository: StacksConfigRepository,
): Promise<InternalStandardStack[]> => {
  const { stackName } = createAwsSchemas({ regions: ctx.regions })

  const stackVariables = createVariablesForStackConfigFile(
    ctx.variables,
    stackGroup,
    stackPath,
  )

  const blueprint = stackConfig.blueprint
    ? await configRepository.getBlueprint(stackConfig.blueprint, stackVariables)
    : undefined

  const builderProps: StandardStackPropBuilderProps = {
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

  return await Promise.all(
    regions
      .filter((region) =>
        isWithinCommandPath(commandPath, `${stackPath}/${region}`),
      )
      .filter((region) => !status.isStackProcessed(`${stackPath}/${region}`))
      .map(async (region) => {
        const exactPath = `${stackPath}/${region}`
        const stackLogger = logger.childLogger(exactPath)
        const getCloudFormationClient = async () => {
          const identity = await credentialManager.getCallerIdentity()
          return ctx.awsClientProvider.createCloudFormationClient({
            credentialProvider: credentialManager.getCredentialProvider(),
            region,
            identity,
            id: exactPath,
            logger: stackLogger,
          })
        }

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

        const props: StandardStackProps = {
          type: STANDARD_STACK_TYPE,
          name,
          template,
          region,
          parameters,
          commandRole,
          credentialManager,
          hooks,
          ignore,
          obsolete,
          terminationProtection,
          capabilities,
          accountIds,
          getCloudFormationClient,
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

        return createStandardStack(props)
      }),
  )
}
