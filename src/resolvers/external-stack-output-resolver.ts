import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation"
import { ObjectSchema } from "joi"
import { createAwsSchemas } from "../schema/aws-schema"
import { IamRoleArn } from "../takomo-aws-model"
import { Resolver, ResolverInput } from "./resolver"
import {
  ResolverProvider,
  ResolverProviderSchemaProps,
} from "./resolver-provider"

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

      const client = new CloudFormationClient({
        region,
        credentials: credentialManager.getCredentialProvider(),
      })

      const { Stacks = [] } = await client.send(
        new DescribeStacksCommand({ StackName: props.stack }),
      )

      if (Stacks.length === 0) {
        throw new Error(`No such stack: ${props.stack}`)
      }

      const output = (Stacks[0].Outputs ?? []).find(
        (o) => o.OutputKey === props.output,
      )

      if (!output?.OutputValue) {
        throw new Error(
          `Stack ${props.stack} does not have output: ${props.output}`,
        )
      }

      return output.OutputValue
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
