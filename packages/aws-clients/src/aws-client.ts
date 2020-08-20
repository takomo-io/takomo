import { Region, TakomoCredentialProvider } from "@takomo/core"
import { Logger } from "@takomo/util"
import { Credentials } from "aws-sdk"
import { ConfigurationOptions } from "aws-sdk/lib/config"
import { AWSError } from "aws-sdk/lib/error"
import { Request } from "aws-sdk/lib/request"
import https from "https"

export interface AwsClientClientProps {
  readonly credentialProvider: TakomoCredentialProvider
  readonly region: Region
  readonly logger: Logger
}

interface PagedResponse {
  readonly NextToken?: string
}

const maxRetries = 30

const randomInt = (min: number, max: number): number => {
  const minC = Math.ceil(min)
  const maxF = Math.floor(max)
  return Math.floor(Math.random() * (maxF - minC + 1) + minC)
}

export abstract class AwsClient<C> {
  private readonly credentialProvider: TakomoCredentialProvider
  private readonly region: Region
  protected readonly logger: Logger

  protected constructor(props: AwsClientClientProps) {
    this.credentialProvider = props.credentialProvider
    this.region = props.region
    this.logger = props.logger
  }

  protected clientOptions = (): ConfigurationOptions => {
    const agent = new https.Agent({
      keepAlive: true,
    })

    return {
      retryDelayOptions: {
        customBackoff: (retryCount: number, err?: Error): number => {
          if (retryCount >= maxRetries) {
            this.logger.error(`Reached max retries ${maxRetries}, aborting`)
            return -1
          }

          const expBackoff = Math.pow(2, retryCount)
          const maxJitter = Math.ceil(expBackoff * 200)
          const backoff = Math.round(expBackoff + randomInt(0, maxJitter))
          const maxBackoff = randomInt(15000, 20000)
          const finalBackoff = Math.min(maxBackoff, backoff)
          this.logger.debug(
            `Request limit exceeded, retry count: ${retryCount}, pausing: ${finalBackoff}ms`,
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
          messages.forEach((m) => this.logger.trace(m)),
      },
    }
  }

  protected abstract getClient(credentials: Credentials, region: Region): C

  protected withClient = async <T>(fn: (client: C) => Promise<T>): Promise<T> =>
    this.credentialProvider
      .getCredentials()
      .then((credentials) => this.getClient(credentials, this.region))
      .then(fn)

  protected withClientPromise = async <T, R>(
    fn: (client: C) => Request<R, AWSError>,
    onSuccess: (result: R) => T,
    onError?: (e: any) => T,
  ): Promise<T> =>
    this.credentialProvider
      .getCredentials()
      .then((credentials) => this.getClient(credentials, this.region))
      .then((client) => fn(client).promise())
      .then(onSuccess)
      .catch((e) => {
        if (onError) {
          return onError(e)
        }
        throw e
      })

  protected pagedOperation = async <T, P, R extends PagedResponse>(
    operation: (params: P) => Request<R, AWSError>,
    params: P,
    extractor: (response: R) => T[] | undefined,
    nextToken?: string,
  ): Promise<T[]> => {
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
      ...(await this.pagedOperation(
        operation,
        params,
        extractor,
        response.NextToken,
      )),
    ]
  }
}
