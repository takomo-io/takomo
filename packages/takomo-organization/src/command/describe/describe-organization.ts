import { CommandStatus } from "@takomo/core"
import { StopWatch } from "@takomo/util"
import { OrganizationContext } from "../../context"
import { DescribeOrganizationIO, DescribeOrganizationOutput } from "./model"

export const describeOrganization = async (
  ctx: OrganizationContext,
  io: DescribeOrganizationIO,
): Promise<DescribeOrganizationOutput> => {
  const watch = new StopWatch("total")
  const client = ctx.getClient()
  const [organization, roots] = await Promise.all([
    client.describeOrganization(),
    client.listOrganizationRoots(),
  ])

  const enabledPolicies = roots[0]
    .PolicyTypes!.filter((p) => p.Status === "ENABLED")
    .map((p) => p.Type!)

  const masterAccount = await client.describeAccount(
    organization.MasterAccountId!,
  )

  // Listing of AWS service access for organization will
  // fail if feature set is not "ALL"
  const services =
    organization.FeatureSet === "ALL"
      ? await client.listAWSServiceAccessForOrganization()
      : []

  return {
    organization,
    services,
    enabledPolicies,
    masterAccount,
    success: true,
    watch: watch.stop(),
    status: CommandStatus.SUCCESS,
    message: "Success",
  }
}
