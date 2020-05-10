import { OrganizationContext } from "../../context"
import { loadData } from "./load"
import {
  DeployOrganizationInput,
  DeployOrganizationIO,
  DeployOrganizationOutput,
} from "./model"

export const deployOrganization = async (
  ctx: OrganizationContext,
  io: DeployOrganizationIO,
  input: DeployOrganizationInput,
): Promise<DeployOrganizationOutput> => {
  const { watch } = input

  return loadData({
    ctx,
    watch,
    io,
    input,
    result: null,
  })
}
