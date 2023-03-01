import Joi from "joi"
import { Region } from "../../../aws/common/model.js"
import { FeatureDisabledError } from "../../../config/project-config.js"
import { InternalCommandContext } from "../../../context/command-context.js"
import {
  createDeploymentTargetsContext,
  DeploymentTargetsConfigRepository,
} from "../../../context/targets-context.js"
import { createConfigSetsSchemas } from "../../../schema/config-sets-schema.js"
import { createDeploymentTargetsSchemas } from "../../../schema/deployment-targets-schema.js"
import { createStacksSchemas } from "../../../schema/stacks-schema.js"
import { CommandHandler } from "../../../takomo-core/command.js"
import { validateInput } from "../../../utils/validation.js"
import {
  DeploymentTargetsOperationInput,
  DeploymentTargetsOperationIO,
  DeploymentTargetsOperationOutput,
} from "./model.js"
import { planDeployment } from "./plan.js"

const inputSchema = (regions: ReadonlyArray<Region>) => {
  const { commandPath } = createStacksSchemas({ regions })
  const { configSetName } = createConfigSetsSchemas({ regions })
  const { deploymentGroupPath, deploymentTargetNamePattern, label } =
    createDeploymentTargetsSchemas({ regions })
  return Joi.object({
    groups: Joi.array().items(deploymentGroupPath).unique(),
    targets: Joi.array().items(deploymentTargetNamePattern).unique(),
    labels: Joi.array().items(label).unique(),
    concurrentTargets: Joi.number().min(1).max(50),
    configSet: configSetName,
    commandPath,
  }).unknown(true)
}

const validateFeatureFlags = (
  ctx: InternalCommandContext,
  input: DeploymentTargetsOperationInput,
): void => {
  if (
    input.operation === "undeploy" &&
    !ctx.projectConfig.features.deploymentTargetsUndeploy
  ) {
    throw new FeatureDisabledError("deploymentTargetsUndeploy")
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
