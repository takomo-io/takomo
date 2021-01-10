import { Region } from "@takomo/aws-model"
import { randomInt, TkmLogger } from "@takomo/util"
import { CognitoIdentityCredentials, Credentials } from "aws-sdk"
import { AWSError } from "aws-sdk/lib/error"
import { Request } from "aws-sdk/lib/request"
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
  "TooManyRequestsException",
  "NetworkingError",
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
}

/**
 * @hidden
 */
export interface AwsClientProps {
  readonly credentialManager: CredentialManager
  readonly region: Region
  readonly logger: TkmLogger
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
export const createClient = <C>({
  credentialManager,
  logger,
  region,
  clientConstructor,
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
      log: (...messages: any[]) => messages.forEach((m) => logger.trace(m)),
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

  const withClient = async <T>(fn: (client: C) => Promise<T>): Promise<T> =>
    getClient().then(fn)

  const withClientPromise = async <T, R>(
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

  return {
    credentialManager,
    region,
    logger,
    getClient,
    withClient,
    withClientPromise,
    pagedOperation,
  }
}
