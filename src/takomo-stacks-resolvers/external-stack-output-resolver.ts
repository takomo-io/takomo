import { ObjectSchema } from "joi"
import { IamRoleArn } from "../takomo-aws-model"
import { createAwsSchemas } from "../takomo-aws-schema"
import {
  Resolver,
  ResolverInput,
  ResolverProvider,
  ResolverProviderSchemaProps,
} from "../takomo-stacks-model"
import { uuid } from "../takomo-util"

const init = async (props: any): Promise<Resolver> => {
  return {
    iamRoleArns: (): IamRoleArn[] =>
      props.commandRole ? [props.commandRole] : [],

    resolve: async ({
      ctx,
      stack,
      logger,
      parameterName,
    }: ResolverInput): Promise<string> => {
      const credentialManager = props.commandRole
        ? await ctx.credentialManager.createCredentialManagerForRole(
            props.commandRole,
          )
        : stack.credentialManager

      const region = props.region ?? stack.region
      logger.debugObject(
        `Resolving value for parameter '${parameterName}' using external-stack-output resolver:`,
        {
          region,
          stack: props.stack,
          output: props.output,
          commandRole: props.commandRole,
        },
      )

      const identity = await credentialManager.getCallerIdentity()

      const cf = await ctx.awsClientProvider.createCloudFormationClient({
        credentialProvider: credentialManager.getCredentialProvider(),
        region,
        logger,
        identity,
        id: uuid(),
      })

      const cfStack = await cf.describeStack(props.stack)
      if (!cfStack) {
        throw new Error(`No such stack: ${props.stack}`)
      }

      const output = cfStack.outputs.find((o) => o.key === props.output)
      if (!output) {
        throw new Error(
          `Stack ${props.stack} does not have output: ${props.output}`,
        )
      }

      return output.value
    },
  }
}

const name = "external-stack-output"

const schema = ({ ctx, base }: ResolverProviderSchemaProps): ObjectSchema => {
  const { region, iamRoleArn, stackName, stackOutputName } = createAwsSchemas({
    regions: ctx.regions,
  })

  return base.keys({
    stack: stackName.required(),
    output: stackOutputName.required(),
    region: region,
    commandRole: iamRoleArn,
  })
}

export const createExternalStackOutputResolverProvider =
  (): ResolverProvider => ({
    name,
    init,
    schema,
  })
