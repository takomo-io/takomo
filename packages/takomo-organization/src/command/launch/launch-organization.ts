import { OrganizationContext } from "../../context"
import { loadData } from "./load"
import {
  LaunchOrganizationInput,
  LaunchOrganizationIO,
  LaunchOrganizationOutput,
} from "./model"

export const launchOrganization = async (
  ctx: OrganizationContext,
  io: LaunchOrganizationIO,
  input: LaunchOrganizationInput,
): Promise<LaunchOrganizationOutput> => {
  const { watch } = input

  return loadData({
    ctx,
    watch,
    io,
    input,
    result: null,
  })
}
