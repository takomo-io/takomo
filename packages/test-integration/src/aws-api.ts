import {
  AwsClientProvider,
  initDefaultCredentialManager,
} from "@takomo/aws-clients"
import { TkmLogger } from "@takomo/util"
import { CloudFormation, Credentials, Organizations } from "aws-sdk"
import { Organization, PolicyType, Root } from "aws-sdk/clients/organizations"
import { mock } from "jest-mock-extended"

const organizationsClient = new Organizations({
  region: "us-east-1",
})

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
  },
}
