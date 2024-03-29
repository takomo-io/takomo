import {
  ListOrganizationalUnitsForParentCommand,
  ListRootsCommand,
  Organizations,
  paginateListAccounts,
  paginateListAccountsForParent,
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
    apiRequestListenerMiddleware(props.logger, props.id, props.listener),
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

  const listOrganizationalUnitsForParent = async (
    parent: OU,
  ): Promise<ReadonlyArray<OU>> => {
    const { OrganizationalUnits = [] } = await client.send(
      new ListOrganizationalUnitsForParentCommand({ ParentId: parent.id }),
    )

    const ous = OrganizationalUnits.map((ou) => convertOU(ou, parent.path))
    const allOus = new Array<OU>(...ous)

    for (const ou of ous) {
      const children = await listOrganizationalUnitsForParent(ou)
      allOus.push(...children)
    }

    return allOus
  }

  const listOrganizationalUnits = async (): Promise<Array<OU>> => {
    const { Roots = [] } = await client.send(new ListRootsCommand({}))
    const rootOus: ReadonlyArray<OU> = Roots.map(convertRoot)

    const allOus = new Array<OU>(...rootOus)
    for (const ou of rootOus) {
      const children = await listOrganizationalUnitsForParent(ou)
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
