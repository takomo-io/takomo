import { CommandStatus, ConfirmResult } from "@takomo/core"
import { processOperation } from "./execute/process-operation"
import { AccountsOperationOutput, LaunchAccountsPlanHolder } from "./model"

export const confirmOperation = async (
  holder: LaunchAccountsPlanHolder,
): Promise<AccountsOperationOutput> => {
  const { watch, io, ctx, plan } = holder
  const childWatch = watch.startChild("confirm")
  const options = ctx.getOptions()

  io.debug("Confirm operation")

  if (options.isAutoConfirmEnabled()) {
    childWatch.stop()
    return processOperation(holder)
  }

  if ((await io.confirmLaunch(plan)) === ConfirmResult.NO) {
    return {
      message: "Cancelled",
      results: [],
      success: false,
      status: CommandStatus.CANCELLED,
      watch: watch.stop(),
    }
  }

  childWatch.stop()
  return processOperation(holder)
}
