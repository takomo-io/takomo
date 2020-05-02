import { CommandStatus } from "@takomo/core"
import { planAccountsLaunch } from "../../../plan/accounts"
import { confirmOperation } from "./confirm"
import { AccountsOperationOutput, LaunchAccountsDataHolder } from "./model"

export const planLaunch = async (
  holder: LaunchAccountsDataHolder,
): Promise<AccountsOperationOutput> => {
  const {
    io,
    watch,
    ctx,
    organizationData,
    input: { organizationalUnits, accountIds, configSetType },
  } = holder
  const childWatch = watch.startChild("plan")

  io.info("Plan operation")

  const plan = await planAccountsLaunch(
    ctx,
    organizationData,
    organizationalUnits,
    accountIds,
    configSetType,
  )

  if (!plan.hasChanges) {
    const message = "No accounts to process"
    io.info(message)
    childWatch.stop()
    return {
      message,
      results: [],
      success: true,
      status: CommandStatus.SKIPPED,
      watch: watch.stop(),
    }
  }

  childWatch.stop()

  return confirmOperation({
    ...holder,
    plan,
  })
}
