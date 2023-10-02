import { AwsCredentialIdentityProvider, Pluggable } from "@aws-sdk/types"
import { IPolicy } from "cockatiel"
import { TkmLogger } from "../../utils/logging.js"
import { Scheduler } from "../../utils/scheduler.js"
import { CallerIdentity, Region } from "./model.js"

interface PagedResponse {
  readonly NextToken?: string
}

interface PagedOperationV2Props<T, P, R extends PagedResponse> {
  /**
   * API operation to execute.
   */
  readonly operation: (params: P) => Promise<R>

  /**
   * Parameters for the API operation.
   */
  readonly params: P

  /**
   * Function that extracts objects from the API response
   * and converts them to the required type.
   */
  readonly extractor: (response: R) => ReadonlyArray<T> | undefined

  /**
   * Next token used to request the next page from API.
   */
  readonly nextToken?: string

  /**
   * Function invoked on every page. Continue paging if returns false,
   * otherwise stop paging.
   */
  readonly onPage?: (items: ReadonlyArray<T>) => boolean

  /**
   * Function to filter objects that should be included in the final result.
   */
  readonly filter?: (item: T) => boolean
}

export interface AwsClientProps {
  readonly credentialProvider?: AwsCredentialIdentityProvider
  readonly region: Region
  readonly logger: TkmLogger
  readonly id: string
}

export interface CloudFormationClientProps extends AwsClientProps {
  readonly identity: CallerIdentity
}

export interface InternalAwsClientProps extends AwsClientProps {
  readonly listener: ClientListener
}

export interface ApiCallProps {
  readonly clientId: string
  readonly api: string
  readonly action: string
  readonly time: number
  readonly start: number
  readonly end: number
  readonly retries: number
}

export interface ClientListener {
  readonly onApiCall: (props: ApiCallProps) => void
}

export const pagedOperation = async <T, P, R extends PagedResponse>(
  operation: (params: P) => Promise<R>,
  params: P,
  extractor: (response: R) => ReadonlyArray<T> | undefined,
  nextToken?: string,
): Promise<ReadonlyArray<T>> => {
  const response = await operation({
    ...params,
    NextToken: nextToken,
  })

  const items = extractor(response) || []
  if (!response.NextToken) {
    return items
  }

  return [
    ...items,
    ...(await pagedOperation(operation, params, extractor, response.NextToken)),
  ]
}

export const withClientScheduler = <C, T>(
  client: C,
  taskId: string,
  scheduler: Scheduler,
  fn: (client: C) => Promise<T>,
  onError?: (e: Error) => T,
): Promise<T> =>
  scheduler.execute<T>({ taskId, fn: () => fn(client) }).catch((e) => {
    if (onError) {
      return onError(e)
    }
    throw e
  })

export const pagedOperationBulkhead = async <T, P, R extends PagedResponse>(
  bulkhead: IPolicy,
  operation: (params: P) => Promise<R>,
  params: P,
  extractor: (response: R) => ReadonlyArray<T> | undefined,
  nextToken?: string,
): Promise<ReadonlyArray<T>> => {
  const response = await bulkhead.execute(() =>
    operation({
      ...params,
      NextToken: nextToken,
    }),
  )

  const items = extractor(response) || []
  if (!response.NextToken) {
    return items
  }

  return [
    ...items,
    ...(await pagedOperationBulkhead(
      bulkhead,
      operation,
      params,
      extractor,
      response.NextToken,
    )),
  ]
}

export const pagedOperationV2 = async <T, P, R extends PagedResponse>({
  operation,
  params,
  extractor,
  nextToken,
  onPage = () => true,
  filter = () => true,
}: PagedOperationV2Props<T, P, R>): Promise<ReadonlyArray<T>> => {
  const response = await operation({
    ...params,
    NextToken: nextToken,
  })

  const items = (extractor(response) ?? []).filter(filter)

  if (onPage(items)) {
    return items
  }

  if (!response.NextToken) {
    return items
  }

  return [
    ...items,
    ...(await pagedOperationV2({
      operation,
      params,
      extractor,
      onPage,
      filter,
      nextToken: response.NextToken,
    })),
  ]
}

export const withClientBulkhead = <C, T>(
  client: C,
  bulkhead: IPolicy,
  fn: (client: C) => Promise<T>,
  onError?: (e: Error) => T,
): Promise<T> =>
  bulkhead
    .execute(() => fn(client))
    .catch((e) => {
      if (onError) {
        return onError(e)
      }
      throw e
    })
