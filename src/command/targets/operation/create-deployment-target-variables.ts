import { DeploymentTargetsContext } from "../../../context/targets-context.js"
import { ConfigSetExecutionTarget } from "../../../takomo-execution-plans/index.js"
import { deepCopy } from "../../../utils/objects.js"
import { PlannedDeploymentTarget } from "../common/plan/model.js"

interface CreateDeploymentTargetVariablesProps {
  readonly ctx: DeploymentTargetsContext
  readonly target: ConfigSetExecutionTarget<PlannedDeploymentTarget>
}

export const createDeploymentTargetVariables = ({
  ctx,
  target,
}: CreateDeploymentTargetVariablesProps): any => {
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
