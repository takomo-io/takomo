import { CredentialManager } from "@takomo/aws-clients"
import { IamRoleArn, StackName } from "@takomo/aws-model"
import { createAwsSchemas } from "@takomo/aws-schema"
import { CommandContext, Vars } from "@takomo/core"
import { TemplateConfig } from "@takomo/stacks-config"
import { HookRegistry } from "@takomo/stacks-hooks"
import {
  CommandPath,
  createStack,
  InternalStack,
  normalizeStackPath,
  SchemaRegistry,
  StackGroup,
  StackPath,
  StackProps,
  Template,
} from "@takomo/stacks-model"
import { ResolverRegistry } from "@takomo/stacks-resolvers"
import {
  deepCopy,
  mapToObject,
  TakomoError,
  TkmLogger,
  validate,
} from "@takomo/util"
import { AnySchema } from "joi"
import R from "ramda"
import { isWithinCommandPath } from "../common"
import { StackConfigNode } from "./config-tree"
import { createVariablesForStackConfigFile } from "./create-variables-for-stack-config-file"
import { getCredentialManager } from "./get-credential-provider"
import { initializeHooks } from "./hooks"
import { makeStackName } from "./make-stack-name"
import { mergeStackSchemas } from "./merge-stack-schemas"
import { buildParameters } from "./parameters"

const buildTemplate = (
  stackPath: StackPath,
  { filename, dynamic, inline }: TemplateConfig,
): Template => {
  if (inline) {
    return {
      dynamic,
      inline,
    }
  }

  return {
    dynamic,
    filename: filename ?? stackPath.substr(1),
  }
}

const validateData = (
  stackPath: StackPath,
  schemas: ReadonlyArray<AnySchema>,
  data: Vars,
): void => {
  schemas.forEach((schema) => {
    const { error } = schema.validate(data, { abortEarly: false })
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
  tags: Map<string, string>,
): void => {
  schemas.forEach((schema) => {
    const tagsObject = mapToObject(tags)
    const { error } = schema.validate(tagsObject, { abortEarly: false })
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
    const { error } = schema.label("name").validate(name, { abortEarly: false })
    if (error) {
      const details = error.details.map((d) => `  - ${d.message}`).join("\n")
      throw new TakomoError(
        `Validation errors in name of stack ${stackPath}:\n\n${details}`,
      )
    }
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

  const name =
    stackConfig.name ||
    makeStackName(stackPath, stackConfig.project || stackGroup.project)

  const regions =
    stackConfig.regions.length > 0 ? stackConfig.regions : stackGroup.regions

  if (regions.length === 0) {
    throw new TakomoError(`Stack ${stackPath} has no regions`)
  }

  const template = buildTemplate(stackPath, stackConfig.template)
  validate(stackName, name, `Name of stack ${stackPath} is not valid`)

  const parameters = await buildParameters(
    ctx,
    stackPath,
    stackConfig.parameters,
    resolverRegistry,
    schemaRegistry,
  )

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

  const accountIds = stackConfig.accountIds || stackGroup.accountIds
  const hookConfigs = [...stackGroup.hooks, ...stackConfig.hooks]
  const hooks = await initializeHooks(hookConfigs, hookRegistry)

  const commandRole = stackConfig.commandRole || stackGroup.commandRole
  const credentialManager = await getCredentialManager(
    commandRole,
    defaultCredentialManager,
    credentialManagers,
  )

  const capabilities = stackConfig.capabilities || stackGroup.capabilities
  const ignore =
    stackConfig.ignore !== undefined ? stackConfig.ignore : stackGroup.ignore

  const terminationProtection =
    stackConfig.terminationProtection !== undefined
      ? stackConfig.terminationProtection
      : stackGroup.terminationProtection

  const stackPolicy = stackConfig.stackPolicy ?? stackGroup.stackPolicy
  const stackPolicyDuringUpdate =
    stackConfig.stackPolicyDuringUpdate ?? stackGroup.stackPolicyDuringUpdate

  const credentials = await credentialManager.getCredentials()
  return await Promise.all(
    regions
      .filter((region) =>
        isWithinCommandPath(commandPath, `${stackPath}/${region}`),
      )
      .map(async (region) => {
        const exactPath = `${stackPath}/${region}`
        const stackLogger = logger.childLogger(exactPath)
        const cloudFormationClient =
          ctx.awsClientProvider.createCloudFormationClient({
            credentials,
            region,
            id: exactPath,
            logger: stackLogger,
          })

        const schemas = await mergeStackSchemas(
          ctx,
          schemaRegistry,
          exactPath,
          stackGroup.schemas,
          stackConfig.schemas,
        )

        const inheritedTags = stackConfig.inheritTags
          ? new Map(stackGroup.tags)
          : new Map()

        const props: StackProps = {
          name,
          template,
          region,
          parameters,
          commandRole,
          credentialManager,
          hooks,
          ignore,
          terminationProtection,
          capabilities,
          accountIds,
          cloudFormationClient,
          stackPolicy,
          stackPolicyDuringUpdate,
          path: exactPath,
          stackGroupPath: stackGroup.path,
          project: stackConfig.project ?? stackGroup.project,
          tags: inheritedTags,
          timeout: stackConfig.timeout ??
            stackGroup.timeout ?? { create: 0, update: 0 },
          dependencies: stackConfig.depends.map((d) =>
            normalizeStackPath(stackGroup.path, d),
          ),
          dependents: [],
          templateBucket:
            stackConfig.templateBucket ?? stackGroup.templateBucket,
          data: deepCopy({ ...stackGroup.data, ...stackConfig.data }),
          logger: stackLogger,
          schemas,
        }

        stackConfig.tags.forEach((value, key) => {
          props.tags.set(key, value)
        })

        validateData(exactPath, schemas?.data ?? [], props.data)
        validateTags(exactPath, schemas?.tags ?? [], props.tags)
        validateName(exactPath, schemas?.name ?? [], name)

        return createStack(props)
      }),
  )
}
