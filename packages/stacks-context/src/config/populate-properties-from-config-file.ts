import { Options } from "@takomo/core"
import { parseStackGroupConfigFile } from "@takomo/stacks-config"
import { StackGroup } from "@takomo/stacks-model"
import { Logger, TemplateEngine } from "@takomo/util"
import { StackGroupConfigNode } from "./tree/stack-group-config-node"

export const populatePropertiesFromConfigFile = async (
  logger: Logger,
  options: Options,
  variables: any,
  stackGroup: StackGroup,
  node: StackGroupConfigNode,
  templateEngine: TemplateEngine,
): Promise<StackGroup> => {
  if (!node.file) {
    return stackGroup
  }

  const configFile = await parseStackGroupConfigFile(
    logger.childLogger(stackGroup.getPath()),
    options,
    variables,
    node.file.fullPath,
    templateEngine,
  )

  const props = stackGroup.toProps()

  if (configFile.project) {
    props.project = configFile.project
  }

  if (configFile.templateBucket) {
    props.templateBucket = configFile.templateBucket
  }

  if (configFile.regions.length > 0) {
    props.regions = configFile.regions
  }

  if (configFile.commandRole) {
    props.commandRole = configFile.commandRole
  }

  if (configFile.capabilities) {
    props.capabilities = configFile.capabilities
  }

  if (configFile.accountIds) {
    props.accountIds = configFile.accountIds
  }

  if (configFile.ignore !== null) {
    props.ignore = configFile.ignore
  }

  if (configFile.terminationProtection !== null) {
    props.terminationProtection = configFile.terminationProtection
  }

  if (configFile.timeout !== null) {
    props.timeout = configFile.timeout
  }

  configFile.tags.forEach((value, key) => {
    props.tags.set(key, value)
  })

  props.data = { ...stackGroup.getData(), ...configFile.data }
  props.hooks = [...stackGroup.getHooks(), ...configFile.hooks]

  return new StackGroup(props)
}
