import { Organizations } from "aws-sdk"
import { Organization, PolicyType, Root } from "aws-sdk/clients/organizations"

const organizationsClient = new Organizations({
  region: "us-east-1",
})

const describeOrganization = async (): Promise<Organization> =>
  organizationsClient
    .describeOrganization()
    .promise()
    .then(res => res.Organization!)

const getRootOrganizationalUnit = async (): Promise<Root> =>
  organizationsClient
    .listRoots()
    .promise()
    .then(res => res.Roots![0])

const getEnabledPolicyTypes = async (): Promise<PolicyType[]> =>
  getRootOrganizationalUnit().then(root => root.PolicyTypes!.map(p => p.Type!))

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

export const aws = {
  organizations: {
    describeOrganization,
    getRoot: getRootOrganizationalUnit,
    getEnabledPolicyTypes,
    deleteOrganization,
    deleteOrganizationIfPresent,
  },
}
