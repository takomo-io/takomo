import Joi from "joi"
import { Region } from "../../../aws/common/model.js"
import { createDeploymentTargetsSchemas } from "../../../schema/deployment-targets-schema.js"
import { CommandHandler } from "../../../takomo-core/command.js"

import {
  createDeploymentTargetsContext,
  DeploymentTargetsConfigRepository,
} from "../../../context/targets-context.js"
import { validateInput } from "../../../utils/validation.js"
import {
  DeploymentTargetsRunInput,
  DeploymentTargetsRunIO,
  DeploymentTargetsRunOutput,
} from "./model.js"
import { planRun } from "./plan.js"
const inputSchema = (regions: ReadonlyArray<Region>) => {
  const { deploymentGroupPath, deploymentTargetNamePattern, label } =
    createDeploymentTargetsSchemas({ regions })
  return Joi.object({
    groups: Joi.array().items(deploymentGroupPath).unique(),
    targets: Joi.array().items(deploymentTargetNamePattern).unique(),
    labels: Joi.array().items(label).unique(),
    concurrentTargets: Joi.number().min(1).max(50),
  }).unknown(true)
}

export const deploymentTargetsRunCommand: CommandHandler<
  DeploymentTargetsConfigRepository,
  DeploymentTargetsRunIO,
  DeploymentTargetsRunInput,
  DeploymentTargetsRunOutput
> = async ({
  ctx,
  input,
  configRepository,
  io,
  credentialManager,
}): Promise<DeploymentTargetsRunOutput> =>
  validateInput(inputSchema(ctx.regions), input)
    .then(() =>
      createDeploymentTargetsContext({
        ctx,
        configRepository,
        credentialManager,
        logger: io,
      }),
    )
    .then((ctx) =>
      planRun({
        ctx,
        input,
        io,
      }),
    )
    .then(io.printOutput)
