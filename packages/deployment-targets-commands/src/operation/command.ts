import { Region } from "@takomo/aws-model"
import {
  CommandHandler,
  FeatureDisabledError,
  InternalCommandContext,
} from "@takomo/core"
import {
  createDeploymentTargetsContext,
  DeploymentTargetsConfigRepository,
} from "@takomo/deployment-targets-context"
import { createDeploymentTargetsSchemas } from "@takomo/deployment-targets-schema"
import { validateInput } from "@takomo/util"
import Joi from "joi"
import {
  DeploymentTargetsOperationInput,
  DeploymentTargetsOperationIO,
  DeploymentTargetsOperationOutput,
} from "./model"
import { planDeployment } from "./plan"

const inputSchema = (regions: ReadonlyArray<Region>) => {
  const {
    deploymentGroupPath,
    deploymentTargetNamePattern,
    label,
  } = createDeploymentTargetsSchemas({ regions })
  return Joi.object({
    groups: Joi.array().items(deploymentGroupPath).unique(),
    targets: Joi.array().items(deploymentTargetNamePattern).unique(),
    labels: Joi.array().items(label).unique(),
    concurrentTargets: Joi.number().min(1).max(50),
  }).unknown(true)
}

const validateFeatureFlags = (
  ctx: InternalCommandContext,
  input: DeploymentTargetsOperationInput,
): void => {
  if (
    input.operation === "undeploy" &&
    input.configSetType === "standard" &&
    !ctx.projectConfig.features.deploymentTargetsUndeploy
  ) {
    throw new FeatureDisabledError("deploymentTargetsUndeploy")
  }

  if (
    input.operation === "undeploy" &&
    input.configSetType === "bootstrap" &&
    !ctx.projectConfig.features.deploymentTargetsTearDown
  ) {
    throw new FeatureDisabledError("deploymentTargetsTearDown")
  }
}

export const deploymentTargetsOperationCommand: CommandHandler<
  DeploymentTargetsConfigRepository,
  DeploymentTargetsOperationIO,
  DeploymentTargetsOperationInput,
  DeploymentTargetsOperationOutput
> = async ({
  ctx,
  input,
  configRepository,
  io,
  credentialManager,
}): Promise<DeploymentTargetsOperationOutput> =>
  validateInput(inputSchema(ctx.regions), input)
    .then(() => {
      validateFeatureFlags(ctx, input)
      return createDeploymentTargetsContext({
        ctx,
        configRepository,
        credentialManager,
        logger: io,
      })
    })
    .then((ctx) =>
      planDeployment({
        ctx,
        input,
        io,
        timer: input.timer,
      }),
    )
    .then(io.printOutput)
