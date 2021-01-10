import { createCloudFormationClient } from "@takomo/aws-clients"
import { createAwsSchemas } from "@takomo/aws-schema"
import {
  Resolver,
  ResolverInput,
  ResolverProvider,
  ResolverProviderSchemaProps,
  StackPath,
} from "@takomo/stacks-model"
import { createStacksSchemas } from "@takomo/stacks-schema"
import { deepFreeze } from "@takomo/util"
import { ObjectSchema } from "joi"

export const init = async (props: any): Promise<Resolver> => {
  return deepFreeze({
    dependencies: (): StackPath[] => [props.stack],

    resolve: async ({
      ctx,
      logger,
      parameterName,
    }: ResolverInput): Promise<any> => {
      logger.debugObject(
        `Resolving value for parameter '${parameterName}' using stack-output resolver:`,
        { stack: props.stack, output: props.output },
      )

      const [referencedStack, ...rest] = ctx.getStacksByPath(props.stack)

      if (!referencedStack) {
        // TODO: We should be able to detect this earlier - when the configuration is being built
        throw new Error(`Stack not found with path: ${props.stack}`)
      }

      if (rest.length > 0) {
        // TODO: We should be able to detect this earlier - when the configuration is being built
        throw new Error(`More than one stack found with path: ${props.stack}`)
      }

      const cf = createCloudFormationClient({
        credentialManager: referencedStack.credentialManager,
        region: referencedStack.region,
        logger,
      })

      const stack = await cf.describeStack(referencedStack.name)
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
}

const name = "stack-output"

const schema = ({ ctx, base }: ResolverProviderSchemaProps): ObjectSchema => {
  const { stackPath } = createStacksSchemas({ regions: ctx.regions })
  const { stackOutputName } = createAwsSchemas({ regions: ctx.regions })
  return base.keys({
    stack: stackPath.required(),
    output: stackOutputName.required(),
  })
}

export const createStackOutputResolverProvider = (): ResolverProvider =>
  deepFreeze({
    name,
    init,
    schema,
  })
