import {
  ListOrganizationalUnitsForParentCommandOutput,
  ListRootsCommand,
  Organizations,
  paginateListAccounts,
  paginateListAccountsForParent,
  paginateListOrganizationalUnitsForParent,
} from "@aws-sdk/client-organizations"
import { InternalAwsClientProps } from "../common/client.js"
import { AccountStatus } from "../common/model.js"
import { customRequestHandler } from "../common/request-handler.js"
import { customRetryStrategy } from "../common/retry.js"
import { convertAccount, convertOU, convertRoot } from "./convert.js"
import { Account, OU, OUId } from "./model.js"
import {
  apiRequestListenerMiddleware,
  apiRequestListenerMiddlewareOptions,
} from "../common/request-listener.js"

export interface OrganizationsClient {
  readonly listAccounts: () => Promise<ReadonlyArray<Account>>
  readonly listAccountsForOU: (ouId: OUId) => Promise<ReadonlyArray<Account>>
  readonly listOrganizationalUnits: () => Promise<ReadonlyArray<OU>>
}

export type OrganizationalUnitsPageProvider = (
  parentId: OUId,
) => AsyncIterable<ListOrganizationalUnitsForParentCommandOutput>

export const collectOrganizationalUnitsForParent = async (
  parent: OU,
  pageProvider: OrganizationalUnitsPageProvider,
): Promise<ReadonlyArray<OU>> => {
  const ous = new Array<OU>()
  for await (const { OrganizationalUnits = [] } of pageProvider(parent.id)) {
    OrganizationalUnits.map((ou) => convertOU(ou, parent.path)).forEach((ou) =>
      ous.push(ou),
    )
  }

  const allOus = new Array<OU>(...ous)
  for (const ou of ous) {
    const children = await collectOrganizationalUnitsForParent(ou, pageProvider)
    allOus.push(...children)
  }

  return allOus
}

export const createOrganizationsClient = (
  props: InternalAwsClientProps,
): OrganizationsClient => {
  const client = new Organizations({
    region: props.region,
    credentials: props.credentialProvider,
    retryStrategy: customRetryStrategy(props.logger),
    requestHandler: customRequestHandler(25),
  })

  client.middlewareStack.add(
    apiRequestListenerMiddleware(
      props.logger,
      props.id,
      props.listener,
      props.confidentialValuesLoggingEnabled,
    ),
    apiRequestListenerMiddlewareOptions,
  )

  const listAccounts = async (): Promise<ReadonlyArray<Account>> => {
    const accounts = new Array<Account>()
    for await (const page of paginateListAccounts({ client }, {})) {
      page.Accounts?.map((a) => ({
        arn: a.Arn!,
        id: a.Id!,
        email: a.Email!,
        name: a.Name!,
        status: a.Status as AccountStatus,
      }))
        .filter((a) => a.status === "ACTIVE")
        .forEach((a) => accounts.push(a))
    }

    return accounts
  }

  const listAccountsForOU = async (
    ouId: OUId,
  ): Promise<ReadonlyArray<Account>> => {
    const accounts = new Array<Account>()
    const pages = paginateListAccountsForParent({ client }, { ParentId: ouId })
    for await (const { Accounts = [] } of pages) {
      Accounts.map((a) => convertAccount(a))
        .filter((a) => a.status === "ACTIVE")
        .forEach((a) => accounts.push(a))
    }

    return accounts
  }

  const organizationalUnitsPageProvider: OrganizationalUnitsPageProvider = (
    parentId,
  ) =>
    paginateListOrganizationalUnitsForParent({ client }, { ParentId: parentId })

  const listOrganizationalUnits = async (): Promise<Array<OU>> => {
    const { Roots = [] } = await client.send(new ListRootsCommand({}))
    const rootOus: ReadonlyArray<OU> = Roots.map(convertRoot)

    const allOus = new Array<OU>(...rootOus)
    for (const ou of rootOus) {
      const children = await collectOrganizationalUnitsForParent(
        ou,
        organizationalUnitsPageProvider,
      )
      allOus.push(...children)
    }

    return allOus
  }

  return {
    listOrganizationalUnits,
    listAccountsForOU,
    listAccounts,
  }
}
