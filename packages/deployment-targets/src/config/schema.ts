import Joi from "@hapi/joi"
import { configSets } from "@takomo/config-sets"
import { vars } from "@takomo/core"
import { deploymentGroups } from "../schema"

export const deploymentGroupsConfigFileSchema = Joi.object({
  vars,
  deploymentGroups,
  configSets,
})
