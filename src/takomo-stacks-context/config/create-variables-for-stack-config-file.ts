import path from "path"
import { Variables } from "../../common/model.js"
import { StackGroup } from "../../stacks/stack-group.js"
import { StackPath } from "../../stacks/stack.js"
import { getVariablesForStackGroup } from "./get-variables-for-stack-group.js"

export const createVariablesForStackConfigFile = (
  variables: Variables,
  stackGroup: StackGroup,
  stackPath: StackPath,
): any => {
  const stackGroupVariables = getVariablesForStackGroup(stackGroup)
  const filePath = stackPath.slice(1)
  return {
    ...variables,
    stack: {
      path: stackPath,
      pathSegments: stackPath.slice(1).split("/"),
      configFile: {
        filePath,
        basename: path.basename(filePath),
        name: path.basename(filePath, ".yml"),
        dirPath: stackGroup.path.slice(1),
      },
    },
    stackGroup: stackGroupVariables,
    parent: stackGroupVariables,
  }
}
