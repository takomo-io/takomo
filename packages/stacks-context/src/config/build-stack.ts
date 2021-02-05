import { CredentialManager } from "@takomo/aws-clients"
import { IamRoleArn } from "@takomo/aws-model"
import { createAwsSchemas } from "@takomo/aws-schema"
import { CommandContext } from "@takomo/core"
import { TemplateConfig } from "@takomo/stacks-config/src/model"
import {
  CommandPath,
  createStack,
  HookInitializersMap,
  InternalStack,
  SchemaRegistry,
  StackGroup,
  StackPath,
  StackProps,
  Template,
} from "@takomo/stacks-model"
import { ResolverRegistry } from "@takomo/stacks-resolvers"
import { deepCopy, TakomoError, TkmLogger, validate } from "@takomo/util"
import flatten from "lodash.flatten"
import uniq from "lodash.uniq"
import { isWithinCommandPath } from "../common"
import { StackConfigNode } from "./config-tree"
import { createVariablesForStackConfigFile } from "./create-variables-for-stack-config-file"
import { getCredentialManager } from "./get-credential-provider"
import { initializeHooks } from "./hooks"
import { makeStackName } from "./make-stack-name"
import { buildParameters } from "./parameters"

const buildTemplate = (
  stackPath: StackPath,
  { filename, dynamic }: TemplateConfig,
): Template => ({
  dynamic,
  filename: filename ?? stackPath.substr(1),
})

export const buildStack = async (
  ctx: CommandContext,
  logger: TkmLogger,
  defaultCredentialManager: CredentialManager,
  credentialManagers: Map<IamRoleArn, CredentialManager>,
  resolverRegistry: ResolverRegistry,
  schemaRegistry: SchemaRegistry,
  hookInitializers: HookInitializersMap,
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

  if (!template) {
    throw new TakomoError(`Stack ${stackPath} has no template`)
  }

  const parameters = await buildParameters(
    ctx,
    stackPath,
    stackConfig.parameters,
    resolverRegistry,
    schemaRegistry,
  )

  uniq(
    flatten(
      Array.from(parameters.values()).reduce((collected, parameter) => {
        return [...collected, parameter.getIamRoleArns()]
      }, new Array<string[]>()),
    ),
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
  const hooks = await initializeHooks(hookConfigs, hookInitializers)

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

  return regions
    .map((region) => {
      const exactPath = `${stackPath}/${region}`

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
        path: exactPath,
        stackGroupPath: stackGroup.path,
        project: stackConfig.project ?? stackGroup.project,
        tags: new Map(stackGroup.tags),
        timeout: stackConfig.timeout ??
          stackGroup.timeout ?? { create: 0, update: 0 },
        dependencies: stackConfig.depends,
        dependents: [],
        templateBucket: stackConfig.templateBucket ?? stackGroup.templateBucket,
        data: deepCopy({ ...stackGroup.data, ...stackConfig.data }),
        logger: logger.childLogger(exactPath),
      }

      stackConfig.tags.forEach((value, key) => {
        props.tags.set(key, value)
      })

      return createStack(props)
    })
    .filter((s) => isWithinCommandPath(commandPath, s.path))
}
