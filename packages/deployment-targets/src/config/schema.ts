import { configSets } from "@takomo/config-sets"
import { vars } from "@takomo/core"
import Joi from "joi"
import { deploymentGroups } from "../schema"

export const deploymentGroupsConfigFileSchema = Joi.object({
  vars,
  deploymentGroups,
  configSets,
})
