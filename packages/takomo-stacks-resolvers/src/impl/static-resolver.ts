import Joi from "@hapi/joi"
import { Resolver, ResolverInput, ResolverProvider } from "@takomo/stacks-model"

export class StaticResolver implements Resolver {
  private readonly value: string

  constructor(props: any) {
    this.value = `${props.value}`
  }

  resolve = async (input: ResolverInput): Promise<any> => this.value
}

export class StaticResolverProvider implements ResolverProvider {
  readonly name = "static"
  init = async (props: any) => new StaticResolver(props)

  schema = (joi: Joi.Root, base: Joi.ObjectSchema): Joi.ObjectSchema =>
    base.keys({
      value: joi
        .alternatives()
        .try(
          joi.string(),
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
}
