import {
  CommandPath,
  IamRoleArn,
  Options,
  stackName,
  TakomoCredentialProvider,
  Variables,
} from "@takomo/core"
import { parseStackConfigFile } from "@takomo/stacks-config"
import {
  HookInitializersMap,
  Stack,
  StackGroup,
  StackProps,
} from "@takomo/stacks-model"
import { ResolverRegistry } from "@takomo/stacks-resolvers"
import { Logger, TakomoError, TemplateEngine, validate } from "@takomo/util"
import flatten from "lodash.flatten"
import uniq from "lodash.uniq"
import { isWithinCommandPath } from "../common"
import { createVariablesForStackConfigFile } from "./create-variables-for-stack-config-file"
import { getCredentialProvider } from "./get-credential-provider"
import { initializeHooks } from "./hooks"
import { makeStackName } from "./make-stack-name"
import { buildParameters } from "./parameters"
import { buildSecrets, makeSecretsPath } from "./secrets"
import { StackConfigNode } from "./tree/stack-config-node"

export const buildStack = async (
  logger: Logger,
  defaultCredentialProvider: TakomoCredentialProvider,
  credentialsProviders: Map<IamRoleArn, TakomoCredentialProvider>,
  resolverRegistry: ResolverRegistry,
  hookInitializers: HookInitializersMap,
  options: Options,
  variables: Variables,
  node: StackConfigNode,
  stackGroup: StackGroup,
  templateEngine: TemplateEngine,
  commandPath: CommandPath,
): Promise<Stack[]> => {
  logger.debug(`Build stack with path '${node.path}'`)

  const stackPath = node.path
  const stackVariables = createVariablesForStackConfigFile(
    variables,
    stackGroup,
    stackPath,
  )

  const stackConfig = await parseStackConfigFile(
    logger.childLogger(stackPath),
    options,
    stackVariables,
    node.file.fullPath,
    templateEngine,
  )

  const name =
    stackConfig.name ||
    makeStackName(stackPath, stackConfig.project || stackGroup.getProject())

  const regions =
    stackConfig.regions.length > 0
      ? stackConfig.regions
      : stackGroup.getRegions()

  if (regions.length === 0) {
    throw new TakomoError(`Stack ${stackPath} has no regions`)
  }

  const template =
    stackConfig.template ||
    `${stackGroup.getPath().slice(1)}/${node.file.basename}`

  validate(stackName, name, `Name of stack ${stackPath} is not valid`)

  if (!template) {
    throw new TakomoError(`Stack ${stackPath} has no template`)
  }

  const parameters = await buildParameters(
    node.file.fullPath,
    stackPath,
    stackConfig.parameters,
    resolverRegistry,
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
      getCredentialProvider(
        commandRole,
        defaultCredentialProvider,
        credentialsProviders,
      )
    })

  const accountIds = stackConfig.accountIds || stackGroup.getAccountIds()
  const hookConfigs = [...stackGroup.getHooks(), ...stackConfig.hooks]
  const hooks = await initializeHooks(hookConfigs, hookInitializers)

  const commandRole = stackConfig.commandRole || stackGroup.getCommandRole()
  const credentialProvider = await getCredentialProvider(
    commandRole,
    defaultCredentialProvider,
    credentialsProviders,
  )

  const capabilities = stackConfig.capabilities || stackGroup.getCapabilities()
  const ignore =
    stackConfig.ignore !== null ? stackConfig.ignore : stackGroup.isIgnored()

  const terminationProtection =
    stackConfig.terminationProtection !== null
      ? stackConfig.terminationProtection
      : stackGroup.isTerminationProtectionEnabled()

  return regions
    .map((region) => {
      const exactPath = `${stackPath}/${region}`
      const secretsPath = makeSecretsPath(
        exactPath,
        stackConfig.project || stackGroup.getProject(),
      )

      const props: StackProps = {
        name,
        template,
        secretsPath,
        region,
        parameters,
        commandRole,
        credentialProvider,
        hooks,
        ignore,
        terminationProtection,
        path: exactPath,
        stackGroupPath: stackGroup.getPath(),
        project: stackConfig.project || stackGroup.getProject(),
        tags: stackGroup.getTags(),
        timeout: stackConfig.timeout ||
          stackGroup.getTimeout() || { create: 0, update: 0 },
        dependencies: stackConfig.depends,
        dependants: [],
        templateBucket:
          stackConfig.templateBucket || stackGroup.getTemplateBucket(),
        data: stackGroup.getData(),
        secrets: buildSecrets(secretsPath, stackConfig.secrets),
        logger: logger.childLogger(stackPath),
        capabilities,
        accountIds,
      }

      stackConfig.tags.forEach((value, key) => {
        props.tags.set(key, value)
      })

      props.data = { ...props.data, ...stackConfig.data }

      return new Stack(props)
    })
    .filter((s) => isWithinCommandPath(commandPath, s.getPath()))
}
