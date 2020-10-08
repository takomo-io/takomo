import { validateInput } from "@takomo/util"
import Joi from "joi"
import { buildDeploymentTargetsContext } from "../../context"
import { deploymentGroupPath, deploymentTargetName } from "../../schema"
import {
  DeploymentTargetsOperationInput,
  DeploymentTargetsOperationIO,
  DeploymentTargetsOperationOutput,
} from "./model"
import { planDeployment } from "./plan"

const schema = Joi.object({
  groups: Joi.array().items(deploymentGroupPath).unique(),
  targets: Joi.array().items(deploymentTargetName).unique(),
}).unknown(true)

export const deploymentTargetsOperationCommand = async (
  input: DeploymentTargetsOperationInput,
  io: DeploymentTargetsOperationIO,
): Promise<DeploymentTargetsOperationOutput> =>
  validateInput(schema, input)
    .then(({ options, variables }) =>
      buildDeploymentTargetsContext(options, variables, input.configFile, io),
    )
    .then((ctx) =>
      planDeployment({
        ctx,
        input,
        io,
        watch: input.watch,
      }),
    )
    .then(io.printOutput)
