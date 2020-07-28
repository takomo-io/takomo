import {
  loadOrganizationState,
  OrganizationContext,
} from "@takomo/organization-context"
import {
  DeployOrganizationInput,
  DeployOrganizationIO,
  DeployOrganizationOutput,
} from "./model"
import { validateLocalConfiguration } from "./validate"

export const loadData = async (
  ctx: OrganizationContext,
  io: DeployOrganizationIO,
  input: DeployOrganizationInput,
): Promise<DeployOrganizationOutput> => {
  const { watch } = input
  const childWatch = watch.startChild("load-organization-data")
  const organizationState = await loadOrganizationState(ctx, io)

  childWatch.stop()

  return validateLocalConfiguration({
    ctx,
    watch,
    io,
    input,
    result: null,
    organizationState,
  })
}
