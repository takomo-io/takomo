import { Region } from "@takomo/aws-model"
import { randomInt, TkmLogger } from "@takomo/util"
import { CognitoIdentityCredentials, Credentials } from "aws-sdk"
import { AWSError } from "aws-sdk/lib/error"
import { Request } from "aws-sdk/lib/request"
import { IPolicy } from "cockatiel"
import https from "https"
import { CredentialManager } from "./credentials"
import ClientConfiguration = CognitoIdentityCredentials.ClientConfiguration

interface PagedResponse {
  readonly NextToken?: string
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
  readonly credentialManager: CredentialManager
  readonly region: Region
  readonly logger: TkmLogger
  readonly getClient: () => Promise<C>
  readonly withClient: <T>(fn: (client: C) => Promise<T>) => Promise<T>
  readonly withClientPromise: <T, R>(
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
  readonly pagedOperationBulkhead: <T, P, R extends PagedResponse>(
    bulkhead: IPolicy,
    operation: (params: P) => Request<R, AWSError>,
    params: P,
    extractor: (response: R) => ReadonlyArray<T> | undefined,
    nextToken?: string,
  ) => Promise<ReadonlyArray<T>>
}

export interface AwsClientProps {
  readonly credentialManager: CredentialManager
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
  credentialManager,
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

  const clientConfiguration = (
    credentials: Credentials,
  ): ClientConfiguration => ({
    ...clientOptions,
    region,
    credentials,
  })

  const getClient = (): Promise<C> =>
    credentialManager
      .getCredentials()
      .then(clientConfiguration)
      .then(clientConstructor)

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
    credentialManager,
    region,
    logger,
    getClient,
    withClient,
    withClientPromise,
    pagedOperation,
    pagedOperationBulkhead,
  }
}
