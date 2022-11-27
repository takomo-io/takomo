import { ObjectSchema } from "joi"
import { Resolver, ResolverInput } from "./resolver"
import {
  ResolverProvider,
  ResolverProviderSchemaProps,
} from "./resolver-provider"

const init = async (props: any): Promise<Resolver> => ({
  resolve: async (input: ResolverInput): Promise<any> => `${props.value}`,
})

const schema = ({ joi, base }: ResolverProviderSchemaProps): ObjectSchema =>
  base.keys({
    value: joi
      .alternatives()
      .try(
        joi.string().allow(""),
        joi.number(),
        joi.boolean(),
        joi
          .array()
          .items(
            joi.string().optional(),
            joi.number().optional(),
            joi.boolean().optional(),
          )
          .min(1),
      )
      .required(),
  })

export const createStaticResolverProvider = (): ResolverProvider => ({
  name: "static",
  init,
  schema,
})
