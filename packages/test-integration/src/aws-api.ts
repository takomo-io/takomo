import { CloudFormation, Stack } from "@aws-sdk/client-cloudformation"
import { EC2 } from "@aws-sdk/client-ec2"
import { SecretsManager } from "@aws-sdk/client-secrets-manager"
import { SSM } from "@aws-sdk/client-ssm"
import { STS } from "@aws-sdk/client-sts"
import { Credentials } from "@aws-sdk/types"
import {
  AwsClientProvider,
  initDefaultCredentialManager,
} from "@takomo/aws-clients"
import { CallerIdentity, StackPolicyBody } from "@takomo/aws-model"
import { TkmLogger } from "@takomo/util"
import { mock } from "jest-mock-extended"

const ssmClient = (region: string, credentials: Credentials): SSM =>
  new SSM({ region, credentials })

const secretsClient = (
  region: string,
  credentials: Credentials,
): SecretsManager => new SecretsManager({ region, credentials })

const ec2Client = (region: string, credentials: Credentials): EC2 =>
  new EC2({ region, credentials })

const stsClient = (credentials: Credentials): STS =>
  new STS({ region: "us-east-1", credentials })

const cloudFormationClient = (
  region: string,
  credentials: Credentials,
): CloudFormation => new CloudFormation({ region, credentials })

export type DescribeStackArgs = {
  credentials: Credentials
  iamRoleArn?: string
  region: string
  stackName: string
}

const describeStack = async ({
  credentials,
  stackName,
  iamRoleArn,
  region,
}: DescribeStackArgs): Promise<Stack> => {
  const cp = await initDefaultCredentialManager(
    () => Promise.resolve(""),
    mock<TkmLogger>(),
    mock<AwsClientProvider>(),
    credentials,
  )
  const stackCp = iamRoleArn
    ? await cp.createCredentialManagerForRole(iamRoleArn)
    : cp

  return cloudFormationClient(region, await stackCp.getCredentials())
    .describeStacks({ StackName: stackName })
    .then((res) => res.Stacks![0])
}

const getStackPolicy = async ({
  credentials,
  stackName,
  iamRoleArn,
  region,
}: DescribeStackArgs): Promise<StackPolicyBody> => {
  const cp = await initDefaultCredentialManager(
    () => Promise.resolve(""),
    mock<TkmLogger>(),
    mock<AwsClientProvider>(),
    credentials,
  )
  const stackCp = iamRoleArn
    ? await cp.createCredentialManagerForRole(iamRoleArn)
    : cp

  return cloudFormationClient(region, await stackCp.getCredentials())
    .getStackPolicy({ StackName: stackName })
    .then((r) => r.StackPolicyBody!)
}

export type PutParamArgs = {
  credentials: Credentials
  iamRoleArn?: string
  region: string
  name: string
  value: string
  encrypted: boolean
}

export interface CreateSecretArgs {
  credentials: Credentials
  iamRoleArn?: string
  region: string
  name: string
  value: string
}

export interface PutSecretArgs {
  credentials: Credentials
  iamRoleArn?: string
  region: string
  secretId: string
  value: string
}

export interface CreateSecretResponse {
  secretId: string
  arn: string
}

export interface PutSecretResponse {
  secretId: string
  arn: string
  versionId: string
  versionStages: string[]
}

export type TagVpcArgs = {
  credentials: Credentials
  iamRoleArn?: string
  region: string
  tagKey: string
  tagValue: string
  cidr: string
}

const putParameter = async ({
  credentials,
  region,
  name,
  value,
  encrypted,
  iamRoleArn,
}: PutParamArgs): Promise<boolean> => {
  const cp = await initDefaultCredentialManager(
    () => Promise.resolve(""),
    mock<TkmLogger>(),
    mock<AwsClientProvider>(),
    credentials,
  )

  const ssmCp = iamRoleArn
    ? await cp.createCredentialManagerForRole(iamRoleArn)
    : cp

  return ssmClient(region, await ssmCp.getCredentials())
    .putParameter({
      Name: name,
      Type: encrypted ? "SecureString" : "String",
      Value: value,
    })
    .then(() => true)
}

const createSecret = async (
  args: CreateSecretArgs,
): Promise<CreateSecretResponse> => {
  const { credentials, region, value, name, iamRoleArn } = args
  console.log(
    "create secret: " + JSON.stringify({ region, value, name, iamRoleArn }),
  )

  const cp = await initDefaultCredentialManager(
    () => Promise.resolve(""),
    mock<TkmLogger>(),
    mock<AwsClientProvider>(),
    credentials,
  )

  const secretCp = iamRoleArn
    ? await cp.createCredentialManagerForRole(iamRoleArn)
    : cp

  return secretsClient(region, await secretCp.getCredentials())
    .createSecret({
      Name: name,
      SecretString: value,
      Tags: [{ Key: "test-resource", Value: "true" }],
    })
    .then((r) => ({
      arn: r.ARN!,
      secretId: r.VersionId!,
    }))
}

const putSecret = async (args: PutSecretArgs): Promise<PutSecretResponse> => {
  const { credentials, region, value, secretId, iamRoleArn } = args
  console.log(
    "put secret: " + JSON.stringify({ region, value, secretId, iamRoleArn }),
  )

  const cp = await initDefaultCredentialManager(
    () => Promise.resolve(""),
    mock<TkmLogger>(),
    mock<AwsClientProvider>(),
    credentials,
  )

  const secretCp = iamRoleArn
    ? await cp.createCredentialManagerForRole(iamRoleArn)
    : cp

  return secretsClient(region, await secretCp.getCredentials())
    .putSecretValue({
      SecretId: secretId,
      SecretString: value,
    })
    .then((r) => ({
      arn: r.ARN!,
      secretId: r.VersionId!,
      versionStages: r.VersionStages ?? [],
      versionId: r.VersionId!,
    }))
}

const tagVpc = async ({
  tagKey,
  tagValue,
  cidr,
  credentials,
  iamRoleArn,
  region,
}: TagVpcArgs): Promise<boolean> => {
  const cp = await initDefaultCredentialManager(
    () => Promise.resolve(""),
    mock<TkmLogger>(),
    mock<AwsClientProvider>(),
    credentials,
  )

  const ec2Cp = iamRoleArn
    ? await cp.createCredentialManagerForRole(iamRoleArn)
    : cp

  const client = ec2Client(region, await ec2Cp.getCredentials())

  return client
    .describeVpcs({})
    .then(
      ({ Vpcs }) =>
        Vpcs!.filter(({ CidrBlock }) => CidrBlock === cidr)[0].VpcId!,
    )
    .then((vpcId) =>
      client.createTags({
        Tags: [{ Key: tagKey, Value: tagValue }],
        Resources: [vpcId],
      }),
    )
    .then(() => true)
}

const getCallerIdentity = async (
  credentials: Credentials,
): Promise<CallerIdentity> =>
  stsClient(credentials)
    .getCallerIdentity({})
    .then((r) => ({ accountId: r.Account!, arn: r.Arn!, userId: r.UserId! }))

export const aws = {
  cloudFormation: {
    describeStack,
    getStackPolicy,
  },
  ssm: {
    putParameter,
  },
  secrets: {
    createSecret,
    putSecret,
  },
  ec2: { tagVpc },
  sts: { getCallerIdentity },
}
