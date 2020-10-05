import { Options, Variables } from "@takomo/core"
import { StackGroup } from "@takomo/stacks-model"
import { Logger, TemplateEngine } from "@takomo/util"
import { createRootStackGroup } from "./create-root-stack-group"
import { createStackGroupFromParent } from "./create-stack-group-from-parent"
import { createVariablesForStackGroupConfigFile } from "./create-variables-for-stack-group-config-file"
import { populatePropertiesFromConfigFile } from "./populate-properties-from-config-file"
import { StackGroupConfigNode } from "./tree/stack-group-config-node"

export const createStackGroup = async (
  logger: Logger,
  options: Options,
  variables: Variables,
  node: StackGroupConfigNode,
  parent: StackGroup | null,
  templateEngine: TemplateEngine,
): Promise<StackGroup> => {
  const stackGroupConfig = parent
    ? createStackGroupFromParent(node, parent)
    : createRootStackGroup()

  const stackGroupVariables = createVariablesForStackGroupConfigFile(
    variables,
    stackGroupConfig,
  )

  return populatePropertiesFromConfigFile(
    logger,
    options,
    stackGroupVariables,
    stackGroupConfig,
    node,
    templateEngine,
  )
}
