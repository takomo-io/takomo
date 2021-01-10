import { Variables } from "@takomo/core"
import { StackGroup } from "@takomo/stacks-model"

export const createVariablesForStackGroupConfigFile = (
  variables: Variables,
  stackGroup: StackGroup,
): any => ({
  ...variables,
  stackGroup: {
    path: stackGroup.path,
    pathSegments: stackGroup.path.substr(1).split("/"),
    name: stackGroup.name,
  },
})
