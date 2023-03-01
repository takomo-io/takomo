import { CommandContext } from "../../context/command-context.js"
import { StackGroup } from "../../stacks/stack-group.js"
import { SchemaRegistry } from "../../takomo-stacks-model/schemas.js"
import { TkmLogger } from "../../utils/logging.js"
import { StackGroupConfigNode } from "./config-tree.js"
import { createRootStackGroup } from "./create-root-stack-group.js"
import { createStackGroupFromParent } from "./create-stack-group-from-parent.js"
import { createVariablesForStackGroupConfigFile } from "./create-variables-for-stack-group-config-file.js"
import { populatePropertiesFromConfigFile } from "./populate-properties-from-config-file.js"

export const doCreateStackGroup = async (
  ctx: CommandContext,
  logger: TkmLogger,
  node: StackGroupConfigNode,
  schemaRegistry: SchemaRegistry,
  parent?: StackGroup,
): Promise<StackGroup> => {
  const stackGroupConfig = parent
    ? createStackGroupFromParent(node, parent)
    : createRootStackGroup()

  const stackGroupVariables = createVariablesForStackGroupConfigFile(
    ctx.variables,
    stackGroupConfig,
    parent,
  )

  return populatePropertiesFromConfigFile(
    ctx,
    schemaRegistry,
    logger,
    stackGroupVariables,
    stackGroupConfig,
    node,
  )
}
