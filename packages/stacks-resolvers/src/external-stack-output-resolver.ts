import { IamRoleArn } from "@takomo/aws-model"
import { createAwsSchemas } from "@takomo/aws-schema"
import {
  Resolver,
  ResolverInput,
  ResolverProvider,
  ResolverProviderSchemaProps,
} from "@takomo/stacks-model"
import { deepFreeze, uuid } from "@takomo/util"
import { ObjectSchema } from "joi"

export const init = async (props: any): Promise<Resolver> => {
  return deepFreeze({
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

      const credentials = await credentialManager.getCredentials()

      const cf = ctx.awsClientProvider.createCloudFormationClient({
        credentials,
        region,
        logger,
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
  })
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

export const createExternalStackOutputResolverProvider = (): ResolverProvider =>
  deepFreeze({
    name,
    init,
    schema,
  })
