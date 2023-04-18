import { DeploymentTargetsContext } from "../../../context/targets-context.js"
import { DeploymentTargetsListener } from "../operation/model.js"
import {
  DeploymentTargetsRunInput,
  DeploymentTargetsRunIO,
  DeploymentTargetsRunOutput,
  TargetsRunPlan,
} from "./model.js"
import { prepare } from "./prepare.js"

interface ConfirmRunProps {
  readonly ctx: DeploymentTargetsContext
  readonly input: DeploymentTargetsRunInput
  readonly io: DeploymentTargetsRunIO
  readonly plan: TargetsRunPlan
  readonly listener: DeploymentTargetsListener
}

export const confirmRun = async ({
  ctx,
  input,
  io,
  plan,
  listener,
}: ConfirmRunProps): Promise<DeploymentTargetsRunOutput> => {
  if (!ctx.autoConfirmEnabled && !(await io.confirmRun(plan))) {
    return {
      timer: input.timer.stop(),
      success: true,
      status: "CANCELLED",
      message: "Cancelled",
      outputFormat: input.outputFormat,
      result: undefined,
    }
  }

  return prepare({ io, input, plan, ctx, listener })
}
