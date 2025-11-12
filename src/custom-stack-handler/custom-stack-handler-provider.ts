import Joi from "joi"
import { CommandContext } from "../context/command-context.js"
import { CustomStackType } from "../stacks/custom-stack.js"
import { CustomStackHandler } from "./custom-stack-handler.js"

/**
 * An interface representing the input object passed to {@linkcode CustomStackHandlerProvider.schema}
 * function when the custom stack handler provider schema is constructed.
 */
export interface CustomStackHandlerProviderSchemaProps {
  /**
   * Context object providing access to the project configuration.
   */
  readonly ctx: CommandContext

  /**
   * A [Joi object](https://joi.dev/api/?v=17.3.0#introduction) that can be
   * used to create validation rules.
   */
  readonly joi: Joi.Root
}

/**
 * An interface to be implemented by objects that initialize {@linkcode CustomStackHandler<CONFIG, STATE>}
 * objects.
 */
export interface CustomStackHandlerProvider<CONFIG, STATE> {
  /**
   * The type of the custom stack that this provider initializes.
   */
  readonly type: CustomStackType

  /**
   * Initialize a custom stack handler.
   */
  readonly init: (config: CONFIG) => Promise<CustomStackHandler<CONFIG, STATE>>

  /**
   * Create a schema used to validate properties used to initialize a new custom stack.
   */
  readonly schema?: (
    props: CustomStackHandlerProviderSchemaProps,
  ) => Joi.ObjectSchema
}
