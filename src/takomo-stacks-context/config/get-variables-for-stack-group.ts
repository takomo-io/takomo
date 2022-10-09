import { StackGroup } from "../../takomo-stacks-model"
import { deepCopy } from "../../takomo-util"

export const getVariablesForStackGroup = (stackGroup: StackGroup): any =>
  deepCopy({
    name: stackGroup.name,
    project: stackGroup.project,
    regions: stackGroup.regions,
    commandRole: stackGroup.commandRole,
    path: stackGroup.path,
    pathSegments: stackGroup.path.substr(1).split("/"),
    isRoot: stackGroup.root,
    templateBucket: stackGroup.templateBucket,
    timeout: stackGroup.timeout,
    tags: Array.from(stackGroup.tags.entries()).map(([key, value]) => ({
      key,
      value,
    })),
    data: stackGroup.data,
    capabilities: stackGroup.capabilities,
    accountIds: stackGroup.accountIds,
    terminationProtection: stackGroup.terminationProtection,
  })
