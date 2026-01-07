import * as R from "ramda"
import { InternalCredentialManager } from "../../aws/common/credentials.js"
import { IamRoleArn } from "../../aws/common/model.js"
import { CommandPath } from "../../command/command-model.js"
import { InternalCommandContext } from "../../context/command-context.js"
import { HookRegistry } from "../../hooks/hook-registry.js"
import { ResolverRegistry } from "../../resolvers/resolver-registry.js"
import { createAwsSchemas } from "../../schema/aws-schema.js"
import { StackGroup } from "../../stacks/stack-group.js"
import { SchemaRegistry } from "../../takomo-stacks-model/schemas.js"
import { isWithinCommandPath } from "../../takomo-stacks-model/util.js"
import { TakomoError } from "../../utils/errors.js"
import { TkmLogger } from "../../utils/logging.js"
import { validate } from "../../utils/validation.js"
import { getCredentialManager } from "./get-credential-provider.js"
import { mergeStackSchemas } from "./merge-stack-schemas.js"
import { buildParameters } from "./parameters.js"
import { ProcessStatus } from "./process-config-tree.js"
import { StackPath } from "../../stacks/stack.js"
import {
  createCustomStack,
  CustomStackProps,
  InternalCustomStack,
} from "../../stacks/custom-stack.js"
import {
  buildAccountIds,
  buildCommandRole,
  buildData,
  buildDependencies,
  buildIgnore,
  buildObsolete,
  buildProject,
  buildRegions,
  buildStackName,
  buildTags,
  buildTerminationProtection,
  buildTimeout,
  StackPropBuilderProps,
  validateData,
  validateName,
  validateTags,
} from "./build-stack.js"
import { CustomStackConfig } from "../../config/custom-stack-config.js"
import { CustomStackHandler } from "../../custom-stacks/custom-stack-handler.js"
import { uuid } from "../../utils/strings.js"

type ParseCustomStackConfigResult = {
  error?: Error
  customConfig?: unknown
}

const parseCustomStackConfig = async (
  stackPath: StackPath,
  logger: TkmLogger,
  handler: CustomStackHandler<any, any>,
  rawConfig: unknown,
): Promise<ParseCustomStackConfigResult> => {
  try {
    const result = await handler.parseConfig({
      rawConfig,
      logger,
      stackPath,
    })

    if (result.success) {
      return { customConfig: result.parsedConfig }
    }

    const { message, error } = result

    logger.error(
      `Parsing custom stack config failed for stack ${stackPath}: ${message}`,
      error,
    )

    return { error }
  } catch (e) {
    logger.error(
      `Unhandled error while parsing custom stack config for stack ${stackPath}`,
      e,
    )
    throw e
  }
}

export const buildCustomStack = async (
  stackPath: StackPath,
  ctx: InternalCommandContext,
  logger: TkmLogger,
  defaultCredentialManager: InternalCredentialManager,
  credentialManagers: Map<IamRoleArn, InternalCredentialManager>,
  resolverRegistry: ResolverRegistry,
  schemaRegistry: SchemaRegistry,
  hookRegistry: HookRegistry,
  stackConfig: CustomStackConfig,
  stackGroup: StackGroup,
  commandPath: CommandPath,
  status: ProcessStatus,
  customStackHandler: CustomStackHandler<any, any>,
): Promise<InternalCustomStack[]> => {
  const { stackName } = createAwsSchemas({ regions: ctx.regions })

  const builderProps: StackPropBuilderProps = {
    stackConfig,
    stackGroup,
  }

  const name = buildStackName(builderProps, stackPath)
  const regions = buildRegions(builderProps)
  const commandRole = buildCommandRole(builderProps)
  const accountIds = buildAccountIds(builderProps)
  const ignore = buildIgnore(builderProps)
  const obsolete = buildObsolete(builderProps)
  const terminationProtection = buildTerminationProtection(builderProps)
  const project = buildProject(builderProps)

  const parameters = await buildParameters(
    ctx,
    stackPath,
    stackConfig.parameters,
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

        const schemas = await mergeStackSchemas(
          ctx,
          schemaRegistry,
          exactPath,
          stackGroup.schemas,
          stackConfig.schemas,
        )

        const tags = buildTags(builderProps)
        const data = buildData(builderProps)
        const timeout = buildTimeout(builderProps)
        const dependencies = buildDependencies(builderProps)

        const { customConfig, error } = await parseCustomStackConfig(
          exactPath,
          logger,
          customStackHandler,
          stackConfig.customConfig,
        )

        if (error) {
          throw error
        }

        const props: CustomStackProps = {
          uuid: uuid(),
          customType: stackConfig.customType,
          customConfig,
          customStackHandler,
          name,
          region,
          parameters,
          commandRole,
          credentialManager,
          ignore,
          obsolete,
          terminationProtection,
          accountIds,
          path: exactPath,
          stackGroupPath: stackGroup.path,
          project,
          tags,
          timeout,
          dependencies,
          dependents: [],
          data,
          logger: stackLogger,
          schemas,
        }

        validateData(exactPath, schemas?.data ?? [], props.data)
        validateTags(exactPath, schemas?.tags ?? [], props.tags)
        validateName(exactPath, schemas?.name ?? [], name)

        return createCustomStack(props)
      }),
  )
}
