import { Region } from "@takomo/aws-model"
import { CommandHandler } from "@takomo/core"
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
    deploymentTargetName,
  } = createDeploymentTargetsSchemas({ regions })
  return Joi.object({
    groups: Joi.array().items(deploymentGroupPath).unique(),
    targets: Joi.array().items(deploymentTargetName).unique(),
  }).unknown(true)
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
}): Promise<DeploymentTargetsOperationOutput> =>
  validateInput(inputSchema(ctx.regions), input)
    .then(() =>
      createDeploymentTargetsContext({
        ctx,
        configRepository,
        logger: io,
      }),
    )
    .then((ctx) =>
      planDeployment({
        ctx,
        input,
        io,
        timer: input.timer,
      }),
    )
    .then(io.printOutput)
