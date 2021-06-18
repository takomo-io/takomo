import {
  AwsClientProvider,
  initDefaultCredentialManager,
} from "@takomo/aws-clients"
import { StackPolicyBody } from "@takomo/aws-model"
import { TkmLogger } from "@takomo/util"
import { CloudFormation, Credentials, EC2, Organizations, SSM } from "aws-sdk"
import { Organization, PolicyType, Root } from "aws-sdk/clients/organizations"
import { mock } from "jest-mock-extended"

const organizationsClient = new Organizations({
  region: "us-east-1",
})

const ssmClient = (region: string, credentials: Credentials): SSM =>
  new SSM({ region, credentials })

const ec2Client = (region: string, credentials: Credentials): EC2 =>
  new EC2({ region, credentials })

const cloudFormationClient = (
  region: string,
  credentials: Credentials,
): CloudFormation => new CloudFormation({ region, credentials })

const listAWSServiceAccessForOrganization = async (): Promise<string[]> =>
  organizationsClient
    .listAWSServiceAccessForOrganization()
    .promise()
    .then((res) =>
      res.EnabledServicePrincipals!.map((s) => s.ServicePrincipal!),
    )

const describeOrganization = async (): Promise<Organization> =>
  organizationsClient
    .describeOrganization()
    .promise()
    .then((res) => res.Organization!)

const getRootOrganizationalUnit = async (): Promise<Root> =>
  organizationsClient
    .listRoots()
    .promise()
    .then((res) => res.Roots![0])

const getEnabledPolicyTypes = async (): Promise<PolicyType[]> =>
  getRootOrganizationalUnit().then((root) =>
    root.PolicyTypes!.map((p) => p.Type!),
  )

const deleteOrganization = async (): Promise<boolean> =>
  organizationsClient
    .deleteOrganization()
    .promise()
    .then(() => true)

const deleteOrganizationIfPresent = async (): Promise<boolean> =>
  describeOrganization()
    .then(() => deleteOrganization())
    .then(() => true)
    .catch(() => false)

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
}: DescribeStackArgs): Promise<CloudFormation.Stack> => {
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
    .promise()
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
    .promise()
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
    .promise()
    .then(() => true)
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
    .promise()
    .then(
      ({ Vpcs }) =>
        Vpcs!.filter(({ CidrBlock }) => CidrBlock === cidr)[0].VpcId!,
    )
    .then((vpcId) =>
      client
        .createTags({
          Tags: [{ Key: tagKey, Value: tagValue }],
          Resources: [vpcId],
        })
        .promise(),
    )
    .then(() => true)
}

export const aws = {
  organizations: {
    describeOrganization,
    getRoot: getRootOrganizationalUnit,
    getEnabledPolicyTypes,
    deleteOrganization,
    deleteOrganizationIfPresent,
    listAWSServiceAccessForOrganization,
  },
  cloudFormation: {
    describeStack,
    getStackPolicy,
  },
  ssm: {
    putParameter,
  },
  ec2: { tagVpc },
}
