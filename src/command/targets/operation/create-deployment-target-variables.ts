import { DeploymentTargetsContext } from "../../../context/targets-context.js"
import { deepCopy } from "../../../utils/objects.js"
import { PlannedDeploymentTarget } from "../common/plan/model.js"
import { ConfigSetExecutionTarget } from "../../../takomo-execution-plans/config-set/model.js"
import { Variables } from "../../../common/model.js"

interface CreateDeploymentTargetVariablesProps {
  readonly ctx: DeploymentTargetsContext
  readonly target: ConfigSetExecutionTarget<PlannedDeploymentTarget>
}

interface DeploymentTargetVariables extends Variables {
  readonly target: Record<string, unknown>
}

export const createDeploymentTargetVariables = ({
  ctx,
  target,
}: CreateDeploymentTargetVariablesProps): DeploymentTargetVariables => {
  return deepCopy({
    env: ctx.variables.env,
    var: target.vars,
    context: ctx.variables.context,
    target: {
      name: target.id,
      accountId: target.data.accountId,
      deploymentGroup: {
        name: target.data.deploymentGroup.name,
        path: target.data.deploymentGroup.path,
      },
    },
  })
}
