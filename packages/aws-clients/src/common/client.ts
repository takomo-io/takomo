import { Region } from "@takomo/aws-model"
import { randomInt, Scheduler, TkmLogger } from "@takomo/util"
import { CognitoIdentityCredentials, Credentials } from "aws-sdk"
import { AWSError } from "aws-sdk/lib/error"
import { Request } from "aws-sdk/lib/request"
import { IPolicy } from "cockatiel"
import https from "https"
import ClientConfiguration = CognitoIdentityCredentials.ClientConfiguration

interface PagedResponse {
  readonly NextToken?: string
}

interface PagedOperationV2Props<T, P, R extends PagedResponse> {
  /**
   * API operation to execute.
   */
  readonly operation: (params: P) => Request<R, AWSError>

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

const maxRetries = 30
const retryableErrorCodes = [
  "UnknownEndpoint",
  "Throttling",
  "ThrottlingException",
  "TooManyRequestsException",
  "NetworkingError",
  "TimeoutError",
]

/**
 * @hidden
 */
export interface AwsClient<C> {
  readonly region: Region
  readonly logger: TkmLogger
  readonly getClient: () => Promise<C>
  readonly withClient: <T>(fn: (client: C) => Promise<T>) => Promise<T>
  readonly withClientPromise: <T, R>(
    fn: (client: C) => Request<R, AWSError>,
    onSuccess: (result: R) => T,
    onError?: (e: any) => T,
  ) => Promise<T>
  readonly withClientPromiseBulkhead: <T, R>(
    bulkhead: IPolicy,
    fn: (client: C) => Request<R, AWSError>,
    onSuccess: (result: R) => T,
    onError?: (e: any) => T,
  ) => Promise<T>
  readonly withClientPromiseScheduler: <T, R>(
    taskId: string,
    scheduler: Scheduler,
    fn: (client: C) => Request<R, AWSError>,
    onSuccess: (result: R) => T,
    onError?: (e: any) => T,
  ) => Promise<T>
  readonly pagedOperation: <T, P, R extends PagedResponse>(
    operation: (params: P) => Request<R, AWSError>,
    params: P,
    extractor: (response: R) => ReadonlyArray<T> | undefined,
    nextToken?: string,
  ) => Promise<ReadonlyArray<T>>
  readonly pagedOperationV2: <T, P, R extends PagedResponse>(
    props: PagedOperationV2Props<T, P, R>,
  ) => Promise<ReadonlyArray<T>>
  readonly pagedOperationBulkhead: <T, P, R extends PagedResponse>(
    bulkhead: IPolicy,
    operation: (params: P) => Request<R, AWSError>,
    params: P,
    extractor: (response: R) => ReadonlyArray<T> | undefined,
    nextToken?: string,
  ) => Promise<ReadonlyArray<T>>
}

export interface AwsClientProps {
  readonly credentials: Credentials
  readonly region: Region
  readonly logger: TkmLogger
  readonly id: string
  readonly listener?: ClientListener
}

/**
 * @hidden
 */
interface ClientProps<C> extends AwsClientProps {
  readonly clientConstructor: (config: ClientConfiguration) => C
}

/**
 * @hidden
 */
export interface ApiCallProps {
  readonly clientId: string
  readonly api: string
  readonly action: string
  readonly time: number
  readonly status: number
  readonly retries: number
}

/**
 * @hidden
 */
export interface ClientListener {
  readonly onApiCall: (props: ApiCallProps) => void
}

/**
 * @hidden
 */
export const buildApiCallProps = (
  clientId: string,
  message: string,
): ApiCallProps => {
  const [info] = message.substr(1).split("(", 2)
  const [stats, action] = info.split("] ")
  const [aws, api, status, time, retries] = stats.split(" ")
  return {
    clientId,
    action,
    api,
    status: parseInt(status),
    time: parseFloat(time),
    retries: parseInt(retries),
  }
}

/**
 * @hidden
 */
export const createClient = <C>({
  credentials,
  logger,
  region,
  clientConstructor,
  listener,
  id: clientId,
}: ClientProps<C>): AwsClient<C> => {
  const agent = new https.Agent({
    keepAlive: true,
  })

  const clientOptions = {
    retryDelayOptions: {
      customBackoff: (retryCount: number, err?: any): number => {
        if (!retryableErrorCodes.includes(err?.code)) {
          logger.debug(`Request failed with error code '${err.code}', aborting`)

          return -1
        }

        if (retryCount >= maxRetries) {
          logger.error(
            `Request failed with error code '${err.code}', max retries ${maxRetries} reached, aborting`,
          )
          return -1
        }

        const expBackoff = Math.pow(2, retryCount)
        const maxJitter = Math.ceil(expBackoff * 200)
        const backoff = Math.round(expBackoff + randomInt(0, maxJitter))
        const maxBackoff = randomInt(15000, 20000)
        const finalBackoff = Math.min(maxBackoff, backoff)
        logger.debug(
          `Request failed with error code '${err?.code}', pause for ${finalBackoff}ms and try again (retry count: ${retryCount})`,
        )
        return finalBackoff
      },
    },
    maxRetries: 30,
    httpOptions: {
      agent,
    },
    logger: {
      log: (...messages: any[]) =>
        messages.forEach((m) => {
          if (listener) {
            listener.onApiCall(buildApiCallProps(clientId, m))
          }
          logger.trace(m)
        }),
    },
  }

  const client = clientConstructor({
    ...clientOptions,
    region,
    credentials,
  })

  const getClient = async (): Promise<C> => client

  const withClient = <T>(fn: (client: C) => Promise<T>): Promise<T> =>
    getClient().then(fn)

  const withClientPromise = <T, R>(
    fn: (client: C) => Request<R, AWSError>,
    onSuccess: (result: R) => T,
    onError?: (e: any) => T,
  ): Promise<T> =>
    getClient()
      .then((client) => fn(client).promise())
      .then(onSuccess)
      .catch((e) => {
        if (onError) {
          return onError(e)
        }
        throw e
      })

  const withClientPromiseBulkhead = <T, R>(
    bulkhead: IPolicy,
    fn: (client: C) => Request<R, AWSError>,
    onSuccess: (result: R) => T,
    onError?: (e: any) => T,
  ): Promise<T> =>
    getClient()
      .then((client) => bulkhead.execute(() => fn(client).promise()))
      .then(onSuccess)
      .catch((e) => {
        if (onError) {
          return onError(e)
        }
        throw e
      })

  const withClientPromiseScheduler = <T, R>(
    taskId: string,
    scheduler: Scheduler,
    fn: (client: C) => Request<R, AWSError>,
    onSuccess: (result: R) => T,
    onError?: (e: any) => T,
  ): Promise<T> =>
    getClient()
      .then((client) =>
        scheduler.execute<R>({ taskId, fn: () => fn(client).promise() }),
      )
      .then(onSuccess)
      .catch((e) => {
        if (onError) {
          return onError(e)
        }
        throw e
      })

  const pagedOperation = async <T, P, R extends PagedResponse>(
    operation: (params: P) => Request<R, AWSError>,
    params: P,
    extractor: (response: R) => ReadonlyArray<T> | undefined,
    nextToken?: string,
  ): Promise<ReadonlyArray<T>> => {
    const response = await operation({
      ...params,
      NextToken: nextToken,
    }).promise()

    const items = extractor(response) || []
    if (!response.NextToken) {
      return items
    }

    return [
      ...items,
      ...(await pagedOperation(
        operation,
        params,
        extractor,
        response.NextToken,
      )),
    ]
  }

  const pagedOperationV2 = async <T, P, R extends PagedResponse>({
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
    }).promise()

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

  const pagedOperationBulkhead = async <T, P, R extends PagedResponse>(
    bulkhead: IPolicy,
    operation: (params: P) => Request<R, AWSError>,
    params: P,
    extractor: (response: R) => ReadonlyArray<T> | undefined,
    nextToken?: string,
  ): Promise<ReadonlyArray<T>> => {
    const response = await bulkhead.execute(() =>
      operation({
        ...params,
        NextToken: nextToken,
      }).promise(),
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

  return {
    region,
    logger,
    getClient,
    withClient,
    withClientPromise,
    withClientPromiseBulkhead,
    withClientPromiseScheduler,
    pagedOperation,
    pagedOperationV2,
    pagedOperationBulkhead,
  }
}
