import { CommandContext } from "@takomo/core"
import { SchemaRegistry, StackGroup } from "@takomo/stacks-model"
import { TkmLogger } from "@takomo/util"
import { StackGroupConfigNode } from "./config-tree"
import { createRootStackGroup } from "./create-root-stack-group"
import { createStackGroupFromParent } from "./create-stack-group-from-parent"
import { createVariablesForStackGroupConfigFile } from "./create-variables-for-stack-group-config-file"
import { populatePropertiesFromConfigFile } from "./populate-properties-from-config-file"

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
