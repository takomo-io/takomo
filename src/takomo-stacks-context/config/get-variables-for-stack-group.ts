import { StackGroup } from "../../stacks/stack-group.js"
import { deepCopy } from "../../utils/objects.js"

export const getVariablesForStackGroup = (stackGroup: StackGroup): any =>
  deepCopy({
    name: stackGroup.name,
    project: stackGroup.project,
    regions: stackGroup.regions,
    commandRole: stackGroup.commandRole,
    path: stackGroup.path,
    pathSegments: stackGroup.path.slice(1).split("/"),
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
