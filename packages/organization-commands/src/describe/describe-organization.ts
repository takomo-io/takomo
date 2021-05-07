import { OrganizationContext } from "@takomo/organization-context"
import { createTimer } from "@takomo/util"
import { DescribeOrganizationOutput } from "./model"

export const describeOrganization = async (
  ctx: OrganizationContext,
): Promise<DescribeOrganizationOutput> => {
  const timer = createTimer("total")
  const client = await ctx.getClient()
  const [organization, roots] = await Promise.all([
    client.describeOrganization(),
    client.listOrganizationRoots(),
  ])

  const [root] = roots
  if (!root) {
    throw new Error("Root not found")
  }

  const enabledPolicies = root.policyTypes
    .filter((p) => p.status === "ENABLED")
    .map((p) => p.type)

  const masterAccount = await client.describeAccount(
    organization.masterAccountId,
  )

  timer.stop()

  return {
    organization,
    enabledPolicies,
    masterAccount,
    success: true,
    timer,
    status: "SUCCESS",
    message: "Success",
  }
}
