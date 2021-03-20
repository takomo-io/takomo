import {
  Resolver,
  ResolverInput,
  ResolverProvider,
  ResolverProviderSchemaProps,
} from "@takomo/stacks-model"
import { createStacksSchemas } from "@takomo/stacks-schema"
import { deepFreeze } from "@takomo/util"
import { ObjectSchema } from "joi"

export const init = async ({ hook }: any): Promise<Resolver> => {
  if (!hook) {
    throw new Error("hook is required property")
  }

  return deepFreeze({
    resolve: async ({
      logger,
      parameterName,
      variables,
    }: ResolverInput): Promise<any> => {
      logger.debug(
        `Resolving value for parameter '${parameterName}' from output of hook ${hook}`,
      )

      if (hook in variables.hooks) {
        return variables.hooks[hook]
      }

      throw new Error(`No such hook: '${hook}'`)
    },
  })
}

const name = "hook-output"

const schema = ({ base, ctx }: ResolverProviderSchemaProps): ObjectSchema => {
  const { hookName } = createStacksSchemas({ regions: ctx.regions })
  return base.keys({
    hook: hookName.required(),
  })
}

export const createHookOutputResolverProvider = (): ResolverProvider =>
  deepFreeze({
    name,
    init,
    schema,
  })
