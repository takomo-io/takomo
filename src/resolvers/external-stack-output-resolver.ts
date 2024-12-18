import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation"
import { ObjectSchema } from "joi"
import { IamRoleArn } from "../aws/common/model.js"
import { createAwsSchemas } from "../schema/aws-schema.js"
import {
  ResolverProvider,
  ResolverProviderSchemaProps,
} from "./resolver-provider.js"
import { Resolver, ResolverInput } from "./resolver.js"
import { CredentialManager } from "../aws/common/credentials.js"

type GetCacheKeyProps = {
  cache: boolean
  stackName: string
  stackRegion: string
  outputName: string
  credentialManager: CredentialManager
}

const getCacheKey = async ({
  cache,
  credentialManager,
  stackRegion,
  stackName,
  outputName,
}: GetCacheKeyProps): Promise<string> => {
  if (!cache) {
    return ""
  }

  const { accountId } = await credentialManager.getCallerIdentity()

  return `external-stack-output/${accountId}/${stackRegion}/${stackName}/${outputName}`
}

type ResolveStackOutputValueProps = {
  stackRegion: string
  stackName: string
  outputName: string
  credentialManager: CredentialManager
}

const resolveStackOutputValue = async ({
  stackRegion,
  credentialManager,
  stackName,
  outputName,
}: ResolveStackOutputValueProps): Promise<string> => {
  const client = new CloudFormationClient({
    region: stackRegion,
    credentials: credentialManager.getCredentialProvider(),
    maxAttempts: 30,
  })

  const { Stacks = [] } = await client.send(
    new DescribeStacksCommand({ StackName: stackName }),
  )

  if (Stacks.length === 0) {
    throw new Error(`No such stack: ${stackName}`)
  }

  const output = (Stacks[0].Outputs ?? []).find(
    (o) => o.OutputKey === outputName,
  )

  const value = output?.OutputValue
  if (!value) {
    throw new Error(`Stack ${stackName} does not have output: ${outputName}`)
  }

  return value
}

type ExternalStackOutputResolverProps = {
  stack: string
  output: string
  region?: string
  commandRole?: string
  cache?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const init = async (props: any): Promise<Resolver> => {
  const {
    commandRole,
    region,
    output: outputName,
    stack: stackName,
    cache = false,
  } = props as ExternalStackOutputResolverProps

  return {
    iamRoleArns: (): IamRoleArn[] => (commandRole ? [commandRole] : []),
    resolve: async ({
      ctx,
      stack,
      logger,
      parameterName,
    }: ResolverInput): Promise<string> => {
      const stackRegion = region ?? stack.region

      const credentialManager = commandRole
        ? await ctx.credentialManager.createCredentialManagerForRole(
            commandRole,
          )
        : stack.credentialManager

      logger.debugObject(
        `Resolving value for parameter '${parameterName}' using external-stack-output resolver:`,
        {
          region,
          stackName,
          outputName,
          commandRole,
          cache,
        },
      )

      const cacheKey = await getCacheKey({
        stackRegion,
        cache,
        credentialManager,
        stackName,
        outputName,
      })

      if (cache) {
        const cachedValue = await ctx.cache.get(cacheKey)
        if (cachedValue) {
          logger.debug(
            `Found resolved output value from cache with cache key: ${cacheKey}`,
          )
          return cachedValue as Promise<string>
        }
      }

      const value = resolveStackOutputValue({
        stackRegion,
        outputName,
        stackName,
        credentialManager,
      })

      if (cache) {
        logger.debug(
          `Put resolved output value to cache with cache key: ${cacheKey}`,
        )
        await ctx.cache.put(cacheKey, value)
      }

      return value
    },
  }
}

const name = "external-stack-output"

const schema = ({
  ctx,
  base,
  joi,
}: ResolverProviderSchemaProps): ObjectSchema => {
  const { region, iamRoleArn, stackName, stackOutputName } = createAwsSchemas({
    regions: ctx.regions,
  })

  return base.keys({
    region,
    cache: joi.boolean(),
    stack: stackName.required(),
    output: stackOutputName.required(),
    commandRole: iamRoleArn,
  })
}

export const createExternalStackOutputResolverProvider =
  (): ResolverProvider => ({
    name,
    init,
    schema,
  })
