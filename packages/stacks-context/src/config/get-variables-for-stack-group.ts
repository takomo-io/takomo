import { StackGroup } from "@takomo/stacks-model"
import { mapToObject } from "@takomo/util"

export const getVariablesForStackGroup = (stackGroup: StackGroup): any => ({
  name: stackGroup.getName(),
  project: stackGroup.getProject(),
  regions: stackGroup.getRegions(),
  commandRole: stackGroup.getCommandRole(),
  path: stackGroup.getPath(),
  pathSegments: stackGroup.getPath().substr(1).split("/"),
  isRoot: stackGroup.isRoot(),
  templateBucket: stackGroup.getTemplateBucket(),
  timeout: stackGroup.getTimeout(),
  tags: mapToObject(stackGroup.getTags()),
  data: stackGroup.getData(),
  capabilities: stackGroup.getCapabilities(),
  accountIds: stackGroup.getAccountIds(),
  terminationProtection: stackGroup.isTerminationProtectionEnabled(),
})
