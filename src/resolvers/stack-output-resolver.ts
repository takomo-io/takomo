import { ObjectSchema } from "joi"
import { createAwsSchemas } from "../schema/aws-schema.js"
import { createStacksSchemas } from "../schema/stacks-schema.js"
import { StackPath } from "../stacks/stack.js"
import {
  ResolverProvider,
  ResolverProviderSchemaProps,
} from "./resolver-provider.js"
import { Resolver, ResolverInput } from "./resolver.js"
import { isStandardStack } from "../stacks/standard-stack.js"

const init = async (props: any): Promise<Resolver> => ({
  dependencies: (): StackPath[] => [props.stack],

  resolve: async ({
    ctx,
    logger,
    parameterName,
    stack: stackConfig,
  }: ResolverInput): Promise<any> => {
    logger.debugObject(
      `Resolving value for parameter '${parameterName}' using stack-output resolver:`,
      () => ({ stack: props.stack, output: props.output }),
    )

    const [referencedStack, ...rest] = ctx.getStacksByPath(
      props.stack,
      stackConfig.stackGroupPath,
    )

    if (!referencedStack) {
      // TODO: We should be able to detect this earlier - when the configuration is being built
      throw new Error(`Stack not found with path: ${props.stack}`)
    }

    if (!isStandardStack(referencedStack)) {
      throw new Error(
        `Stack with path ${props.stack} is not a standard stack. Stack output resolver can only be used with standard stacks`,
      )
    }

    if (rest.length > 0) {
      // TODO: We should be able to detect this earlier - when the configuration is being built
      throw new Error(`More than one stack found with path: ${props.stack}`)
    }

    const stack = await referencedStack.getCurrentCloudFormationStack()
    if (!stack) {
      throw new Error(`No such stack: ${referencedStack.name}`)
    }

    const output = stack.outputs.find((o) => o.key === props.output)
    if (!output) {
      throw new Error(
        `Stack ${referencedStack.name} does not have output ${props.output}`,
      )
    }

    return output.value
  },
})

const name = "stack-output"

const schema = ({ ctx, base }: ResolverProviderSchemaProps): ObjectSchema => {
  const { relativeStackPath } = createStacksSchemas({ regions: ctx.regions })
  const { stackOutputName } = createAwsSchemas({ regions: ctx.regions })
  return base.keys({
    stack: relativeStackPath.required(),
    output: stackOutputName.required(),
  })
}

export const createStackOutputResolverProvider = (): ResolverProvider => ({
  name,
  init,
  schema,
})
