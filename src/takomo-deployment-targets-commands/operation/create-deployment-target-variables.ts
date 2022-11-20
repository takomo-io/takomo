import { DeploymentTargetsContext } from "../../takomo-deployment-targets-context"
import { ConfigSetExecutionTarget } from "../../takomo-execution-plans"
import { deepCopy } from "../../utils/objects"
import { PlannedDeploymentTarget } from "../common/plan/model"

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
