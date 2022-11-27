import Joi from "joi"
import { CommandContext } from "../context/command-context"
import { Resolver, ResolverName } from "./resolver"

/**
 * An interface representing the input object passed to {@linkcode ResolverProvider.schema}
 * function when the resolver provider schema is constructed.
 */
export interface ResolverProviderSchemaProps {
  /**
   * Context object providing access to the project configuration.
   */
  readonly ctx: CommandContext

  /**
   * A [Joi object](https://joi.dev/api/?v=17.3.0#introduction) that can be
   * used to create validation rules.
   */
  readonly joi: Joi.Root

  /**
   * A pre-initialized [Joi object schema](https://joi.dev/api/?v=17.3.0#object)
   * for the resolver provider.
   */
  readonly base: Joi.ObjectSchema
}

/**
 * An interface to be implemented by objects that initialize {@linkcode Resolver}
 * objects.
 */
export interface ResolverProvider {
  /**
   * The name of the resolver that this provider initializes.
   */
  readonly name: ResolverName | (() => ResolverName)

  /**
   * Initialize a resolver.
   */
  readonly init: (props: any) => Promise<Resolver>

  /**
   * Create a schema used to validate properties used to initialize a new resolver.
   */
  readonly schema?: (props: ResolverProviderSchemaProps) => Joi.ObjectSchema
}
