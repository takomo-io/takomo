import { Variables } from "../../takomo-core"
import { StackGroup } from "../../takomo-stacks-model"
import { getVariablesForStackGroup } from "./get-variables-for-stack-group"

export const createVariablesForStackGroupConfigFile = (
  variables: Variables,
  stackGroup: StackGroup,
  parent?: StackGroup,
): any => ({
  ...variables,
  stackGroup: {
    path: stackGroup.path,
    pathSegments: stackGroup.path.substr(1).split("/"),
    name: stackGroup.name,
  },
  parent: parent ? getVariablesForStackGroup(parent) : undefined,
})
