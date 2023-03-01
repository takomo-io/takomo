import { Variables } from "../../common/model.js"
import { StackGroup } from "../../stacks/stack-group.js"
import { getVariablesForStackGroup } from "./get-variables-for-stack-group.js"

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
