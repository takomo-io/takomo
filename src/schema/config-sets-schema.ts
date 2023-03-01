import Joi, { ObjectSchema, StringSchema } from "joi"
import { Region } from "../aws/common/model.js"
import { createCommonSchema } from "./common-schema.js"
import { createStacksSchemas } from "./stacks-schema.js"

interface CreateConfigSetsSchemasProps {
  readonly regions: ReadonlyArray<Region>
}

export interface ConfigSetsSchemas {
  readonly configSets: ObjectSchema
  readonly configSet: ObjectSchema
  readonly configSetName: StringSchema
  readonly stageName: StringSchema
  readonly configSetInstruction: ObjectSchema
}

export const createConfigSetsSchemas = (
  props: CreateConfigSetsSchemasProps,
): ConfigSetsSchemas => {
  const { commandPath } = createStacksSchemas({ ...props })
  const { vars } = createCommonSchema()

  const configSetName = Joi.string()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z_]+[a-zA-Z0-9-_]*$/)

  const configSet = Joi.object({
    description: Joi.string(),
    commandPaths: Joi.array().items(commandPath).unique(),
    vars,
  })

  const configSets = Joi.object().pattern(configSetName, configSet)

  const stageName = Joi.string()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z_]+[a-zA-Z0-9-_]*$/)

  const configSetInstruction = Joi.object({
    name: configSetName.required(),
    stage: stageName,
  })

  return {
    configSets,
    configSet,
    configSetName,
    configSetInstruction,
    stageName,
  }
}
