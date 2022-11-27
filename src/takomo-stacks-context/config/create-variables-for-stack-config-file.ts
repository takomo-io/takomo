import path from "path"
import { Variables } from "../../common/model"
import { StackPath } from "../../stacks/stack"
import { StackGroup } from "../../stacks/stack-group"
import { getVariablesForStackGroup } from "./get-variables-for-stack-group"

export const createVariablesForStackConfigFile = (
  variables: Variables,
  stackGroup: StackGroup,
  stackPath: StackPath,
): any => {
  const stackGroupVariables = getVariablesForStackGroup(stackGroup)
  const filePath = stackPath.substr(1)
  return {
    ...variables,
    stack: {
      path: stackPath,
      pathSegments: stackPath.substr(1).split("/"),
      configFile: {
        filePath,
        basename: path.basename(filePath),
        name: path.basename(filePath, ".yml"),
        dirPath: stackGroup.path.substr(1),
      },
    },
    stackGroup: stackGroupVariables,
    parent: stackGroupVariables,
  }
}
