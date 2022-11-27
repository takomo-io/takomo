import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager"
import jmespath from "jmespath"
import { ObjectSchema } from "joi"
import { createAwsSchemas } from "../schema/aws-schema"
import { IamRoleArn } from "../takomo-aws-model"
import { TkmLogger } from "../utils/logging"
import { Resolver, ResolverInput } from "./resolver"
import {
  ResolverProvider,
  ResolverProviderSchemaProps,
} from "./resolver-provider"

const parseSecret = (logger: TkmLogger, secretValue: string): unknown => {
  try {
    return JSON.parse(secretValue)
  } catch (e) {
    logger.error("Could not convert secret to an object", e)
    throw e
  }
}

const querySecret = (
  logger: TkmLogger,
  secretObject: unknown,
  query: string,
): unknown => {
  try {
    return jmespath.search(secretObject, query)
  } catch (e) {
    logger.error("Could not query value from the secret object", e)
    throw e
  }
}

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
      `Resolving value for parameter '${parameterName}' using secret resolver:`,
      {
        region,
        name: props.name,
        commandRole: props.commandRole,
        versionId: props.versionId,
        versionStage: props.versionStage,
        query: props.query,
      },
    )

    const client = new SecretsManagerClient({
      region,
      credentials: credentialManager.getCredentialProvider(),
    })

    const secretValue = await client
      .send(
        new GetSecretValueCommand({
          SecretId: props.secretId,
          VersionId: props.versionId,
          VersionStage: props.versionStage,
        }),
      )
      .then((r) => r.SecretString!)

    if (!props.query) {
      return secretValue
    }

    const secretObject = parseSecret(logger, secretValue)

    return querySecret(logger, secretObject, props.query)
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
    versionId: joi.string(),
    query: joi.string(),
    versionStage: joi.string(),
    secretId: joi.string().required(),
  })
}

const name = "secret"

export const createSecretResolverProvider = (): ResolverProvider => ({
  name,
  init,
  schema,
})
