import { CommandHandler } from "@takomo/core"
import {
  buildOrganizationContext,
  OrganizationConfigRepository,
} from "@takomo/organization-context"
import { describeOrganization } from "./describe-organization"
import {
  DescribeOrganizationInput,
  DescribeOrganizationIO,
  DescribeOrganizationOutput,
} from "./model"

export const describeOrganizationCommand: CommandHandler<
  OrganizationConfigRepository,
  DescribeOrganizationIO,
  DescribeOrganizationInput,
  DescribeOrganizationOutput
> = async ({
  ctx,
  configRepository,
  io,
  input,
  credentialManager,
}): Promise<DescribeOrganizationOutput> =>
  buildOrganizationContext(ctx, configRepository, io, credentialManager)
    .then((ctx) => describeOrganization(ctx, input))
    .then(io.printOutput)
