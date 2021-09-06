// import { ConfigSetName, ConfigSetType, StageName } from "@takomo/config-sets"
// import { OperationState, resolveCommandOutputBase } from "@takomo/core"
// import { Timer } from "@takomo/util"
// import { IPolicy, Policy } from "cockatiel"
// import { AccountsPlanAccount, AccountsPlanOU } from "../../common/model"
// import {
//   AccountOperationResult,
//   AccountsListener,
//   OrganizationalUnitAccountsOperationResult,
// } from "../model"
// import { AccountsOperationPlanHolder } from "../states"
// import { processAccount } from "./account"
//
// type AccountOperation = () => Promise<AccountOperationResult>
//
// interface ConvertToOperationProps {
//   readonly holder: AccountsOperationPlanHolder
//   readonly organizationalUnit: AccountsPlanOU
//   readonly timer: Timer
//   readonly policy: IPolicy
//   readonly account: AccountsPlanAccount
//   readonly state: OperationState
//   readonly configSetType: ConfigSetType
//   readonly results: Array<AccountOperationResult>
//   readonly accountsListener: AccountsListener
//   readonly stage?: StageName
//   readonly configSetName?: ConfigSetName
// }
//
// const convertToOperation =
//   ({
//     holder,
//     organizationalUnit,
//     timer,
//     policy,
//     account,
//     state,
//     configSetType,
//     results,
//     accountsListener,
//     stage,
//     configSetName,
//   }: ConvertToOperationProps): AccountOperation =>
//   () =>
//     policy.execute(async () => {
//       await accountsListener.onAccountBegin()
//       const result = await processAccount(
//         holder,
//         organizationalUnit,
//         account,
//         timer.startChild(account.account.id),
//         state,
//         configSetType,
//         stage,
//         configSetName,
//       )
//
//       results.push(result)
//       await accountsListener.onAccountComplete()
//       return result
//     })
//
// export const processOrganizationalUnit = async (
//   accountsListener: AccountsListener,
//   holder: AccountsOperationPlanHolder,
//   organizationalUnit: AccountsPlanOU,
//   timer: Timer,
//   state: OperationState,
//   configSetType: ConfigSetType,
//   stage?: StageName,
//   configSetName?: ConfigSetName,
// ): Promise<OrganizationalUnitAccountsOperationResult> => {
//   const {
//     io,
//     input: { concurrentAccounts },
//   } = holder
//
//   io.info(
//     `Process organizational unit '${organizationalUnit.path}' with ${organizationalUnit.accounts.length} account(s)`,
//   )
//
//   const policy = Policy.bulkhead(concurrentAccounts, 10000)
//   const results = new Array<AccountOperationResult>()
//
//   const operations = organizationalUnit.accounts.map((account) =>
//     convertToOperation({
//       holder,
//       timer,
//       policy,
//       account,
//       configSetType,
//       organizationalUnit,
//       results,
//       state,
//       accountsListener,
//       stage,
//       configSetName,
//     }),
//   )
//
//   await Promise.all(operations.map((o) => o()))
//
//   timer.stop()
//   return {
//     ...resolveCommandOutputBase(results),
//     path: organizationalUnit.path,
//     stage,
//     results,
//     timer,
//   }
// }
