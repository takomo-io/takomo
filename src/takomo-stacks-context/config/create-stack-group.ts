import { CommandContext } from "../../context/command-context"
import { StackGroup } from "../../stacks/stack-group"
import { SchemaRegistry } from "../../takomo-stacks-model/schemas"
import { TkmLogger } from "../../utils/logging"
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
