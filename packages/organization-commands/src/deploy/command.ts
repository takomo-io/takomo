import { CommandHandler } from "@takomo/core"
import {
  buildOrganizationContext,
  OrganizationConfigRepository,
} from "@takomo/organization-context"
import {
  DeployOrganizationInput,
  DeployOrganizationIO,
  DeployOrganizationOutput,
} from "./model"
import { executeSteps } from "./steps"
import { createDeployOrganizationTransitions } from "./transitions"

export const deployOrganizationCommand: CommandHandler<
  OrganizationConfigRepository,
  DeployOrganizationIO,
  DeployOrganizationInput,
  DeployOrganizationOutput
> = async ({
  ctx,
  input,
  configRepository,
  io,
  credentialManager,
}): Promise<DeployOrganizationOutput> =>
  buildOrganizationContext(ctx, configRepository, io, credentialManager)
    .then((ctx) =>
      executeSteps({
        ctx,
        configRepository,
        io,
        totalTimer: input.timer,
        transitions: createDeployOrganizationTransitions(),
      }),
    )
    .then(io.printOutput)
