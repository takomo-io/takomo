import Joi, { AnySchema } from "joi"
import { CommandContext } from "../takomo-core"
import {
  createSchemaRegistry,
  defaultSchema,
  SchemaName,
  SchemaRegistry,
} from "../takomo-stacks-model"
import { TakomoError, TkmLogger } from "../takomo-util"

export type DeploymentGroupName = string
export type DeploymentTargetName = string
export type DeploymentTargetNamePattern = string
export type DeploymentGroupPath = string
export type DeploymentStatus = "active" | "disabled"
export type Label = string

export interface DeploymentTargetsSchemaRegistry extends SchemaRegistry {
  readonly initDeploymentTargetsSchema: (
    ctx: CommandContext,
    deploymentGroupPath: DeploymentGroupPath,
    name: SchemaName,
    props: Record<string, unknown>,
  ) => Promise<AnySchema>
}

export const createDeploymentTargetsSchemaRegistry = (
  logger: TkmLogger,
): DeploymentTargetsSchemaRegistry => {
  const schemaRegistry = createSchemaRegistry(logger)
  return {
    ...schemaRegistry,
    initDeploymentTargetsSchema: async (
      ctx: CommandContext,
      deploymentGroupPath: DeploymentGroupPath,
      name: SchemaName,
      props: Record<string, unknown>,
    ): Promise<AnySchema> => {
      logger.debug(
        `Initialize schema '${name}' for deployment group '${deploymentGroupPath}'`,
      )
      const provider = schemaRegistry.getProvider(name)
      if (!provider) {
        throw new Error(`Provider not found for schema '${name}'`)
      }

      if (provider.schema) {
        const schema = provider.schema({
          ctx,
          joi: Joi.defaults((schema) => schema),
          base: defaultSchema(name),
        })

        if (!Joi.isSchema(schema)) {
          throw new TakomoError(
            `Error initializing schema '${name}' for deployment group '${deploymentGroupPath}':\n\n` +
              `  - value returned from schema function is not a Joi schema object`,
          )
        }

        const { error } = schema.validate(props, {
          abortEarly: false,
          convert: false,
        })
        if (error) {
          const details = error.details
            .map((d) => `  - ${d.message}`)
            .join("\n")
          throw new TakomoError(
            `${error.details.length} validation error(s) in schema '${name}' configuration for deployment group '${deploymentGroupPath}':\n\n${details}`,
          )
        }
      }

      return provider.init({
        joi: Joi.defaults((schema) => schema),
        ctx,
        props,
      })
    },
  }
}
