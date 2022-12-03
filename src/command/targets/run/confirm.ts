import { DeploymentTargetsContext } from "../../../context/targets-context"
import { DeploymentTargetsListener } from "../operation/model"
import {
  DeploymentTargetsRunInput,
  DeploymentTargetsRunIO,
  DeploymentTargetsRunOutput,
  TargetsRunPlan,
} from "./model"
import { run } from "./run"

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

  return run({ io, input, plan, ctx, listener })
}