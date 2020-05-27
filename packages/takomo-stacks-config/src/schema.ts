import Joi from "@hapi/joi"
import {
  accountId,
  accountIds,
  data,
  iamRoleArn,
  project,
  regions,
  stackName,
  stackPath,
  stackPaths,
} from "@takomo/core"
import {
  hooks,
  ignore,
  parameters,
  secrets,
  stackCapabilities,
  tags,
  template,
  templateBucket,
  timeout,
} from "@takomo/stacks-schema"

export const stackGroupConfigFileSchema = Joi.object({
  project,
  templateBucket,
  tags,
  hooks,
  data,
  regions,
  ignore,
  accountIds: [accountId, accountIds],
  timeout,
  commandRole: iamRoleArn,
  capabilities: stackCapabilities,
})

export const stackConfigFileSchema = Joi.object({
  project,
  regions,
  ignore,
  accountIds: [accountId, accountIds],
  commandRole: iamRoleArn,
  templateBucket,
  tags,
  hooks,
  data,
  template,
  parameters,
  secrets,
  timeout,
  name: stackName,
  depends: [stackPath, stackPaths],
  capabilities: stackCapabilities,
})
