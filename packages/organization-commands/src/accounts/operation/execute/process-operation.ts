import { resolveCommandOutputBase } from "@takomo/core"
import {
  AccountsOperationOutput,
  LaunchAccountsPlanHolder,
  OrganizationalUnitAccountsOperationResult,
} from "../model"
import { processOrganizationalUnit } from "./organizational-units"

export const processOperation = async (
  holder: LaunchAccountsPlanHolder,
): Promise<AccountsOperationOutput> => {
  const {
    watch,
    io,
    plan,
    input: { configSetType },
  } = holder
  const childWatch = watch.startChild("process")
  const results = new Array<OrganizationalUnitAccountsOperationResult>()

  io.info("Process operation")

  const state = { failed: false }

  for (const organizationalUnit of plan.organizationalUnits) {
    const result = await processOrganizationalUnit(
      holder,
      organizationalUnit,
      childWatch.startChild(organizationalUnit.path),
      state,
      configSetType,
    )

    results.push(result)
  }

  return {
    ...resolveCommandOutputBase(results),
    results,
    watch: childWatch.stop(),
  }
}
