import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm"
import { ObjectSchema } from "joi"
import { IamRoleArn } from "../aws/common/model"
import { createAwsSchemas } from "../schema/aws-schema"
import { Resolver, ResolverInput } from "./resolver"
import {
  ResolverProvider,
  ResolverProviderSchemaProps,
} from "./resolver-provider"

const init = async (props: any): Promise<Resolver> => ({
  iamRoleArns: (): IamRoleArn[] =>
    props.commandRole ? [props.commandRole] : [],
  resolve: async ({
    ctx,
    stack,
    logger,
    parameterName,
  }: ResolverInput): Promise<any> => {
    const credentialManager = props.commandRole
      ? await ctx.credentialManager.createCredentialManagerForRole(
          props.commandRole,
        )
      : stack.credentialManager

    const region = props.region ?? stack.region
    logger.debugObject(
      `Resolving value for parameter '${parameterName}' using ssm resolver:`,
      {
        region,
        name: props.name,
        commandRole: props.commandRole,
      },
    )

    const client = new SSMClient({
      region,
      credentials: credentialManager.getCredentialProvider(),
    })

    return client
      .send(new GetParameterCommand({ Name: props.name, WithDecryption: true }))
      .then((r) => r.Parameter!.Value!)
  },
})

const schema = ({
  joi,
  base,
  ctx,
}: ResolverProviderSchemaProps): ObjectSchema => {
  const { region, iamRoleArn } = createAwsSchemas({ regions: ctx.regions })
  return base.keys({
    region,
    commandRole: iamRoleArn,
    name: joi
      .string()
      .regex(/^[a-zA-Z0-9_.\-/]+$/)
      .max(2048)
      .required(),
  })
}

const name = "ssm"

export const createSsmResolverProvider = (): ResolverProvider => ({
  name,
  init,
  schema,
})
