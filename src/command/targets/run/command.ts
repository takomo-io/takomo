import Joi from "joi"
import { Region } from "../../../aws/common/model"
import { createDeploymentTargetsSchemas } from "../../../schema/deployment-targets-schema"
import { CommandHandler } from "../../../takomo-core/command"

import {
  createDeploymentTargetsContext,
  DeploymentTargetsConfigRepository,
} from "../../../context/targets-context"
import { validateInput } from "../../../utils/validation"
import {
  DeploymentTargetsRunInput,
  DeploymentTargetsRunIO,
  DeploymentTargetsRunOutput,
} from "./model"
import { planRun } from "./plan"
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
