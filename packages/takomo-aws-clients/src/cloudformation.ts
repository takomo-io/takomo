import { Region } from "@takomo/core"
import { sleep } from "@takomo/util"
import { CloudFormation, Credentials } from "aws-sdk"
import {
  CreateChangeSetInput,
  CreateStackInput,
  DeleteStackInput,
  DescribeChangeSetOutput,
  UpdateStackInput,
  ValidateTemplateInput,
} from "aws-sdk/clients/cloudformation"
import last from "lodash.last"
import takeRightWhile from "lodash.takerightwhile"
import uuid from "uuid"
import { AwsClient, AwsClientClientProps } from "./aws-client"

export class CloudFormationClient extends AwsClient<CloudFormation> {
  constructor(props: AwsClientClientProps) {
    super(props)
  }

  protected getClient = (
    credentials: Credentials,
    region: Region,
  ): CloudFormation =>
    new CloudFormation({
      ...this.clientOptions(),
      credentials,
      region,
    })

  validateTemplate = async (input: ValidateTemplateInput): Promise<boolean> =>
    this.withClientPromise(
      (c) => c.validateTemplate(input),
      () => true,
    )

  describeStack = async (
    stackName: string,
  ): Promise<CloudFormation.Stack | null> =>
    this.withClientPromise(
      (c) => c.describeStacks({ StackName: stackName }),
      (res) => res.Stacks![0],
      (e) => {
        if (e.code === "ValidationError") {
          if (e.message === `Stack with id ${stackName} does not exist`) {
            return null
          }
        }

        throw e
      },
    )

  getCurrentTemplate = async (stackName: string): Promise<string> =>
    this.withClientPromise(
      (c) => c.getTemplate({ StackName: stackName }),
      (res) => res.TemplateBody!,
    )

  initiateStackDeletion = async (input: DeleteStackInput): Promise<boolean> =>
    this.withClientPromise(
      (c) => c.deleteStack(input),
      () => true,
    )

  createChangeSet = async (
    params: CreateChangeSetInput,
  ): Promise<CloudFormation.ChangeSetId> =>
    this.withClientPromise(
      (c) => c.createChangeSet(params),
      (res) => res.Id!,
    )

  deleteChangeSet = async (
    stackName: string,
    changeSetName: string,
  ): Promise<boolean> => {
    const params = {
      StackName: stackName,
      ChangeSetName: changeSetName,
    }

    return this.withClientPromise(
      (c) => c.deleteChangeSet(params),
      () => true,
    )
  }

  describeChangeSet = async (
    stackName: string,
    changeSetName: string,
  ): Promise<DescribeChangeSetOutput> => {
    const params = {
      ChangeSetName: changeSetName,
      StackName: stackName,
    }

    return this.withClientPromise(
      (c) => c.describeChangeSet(params),
      (res) => res,
    )
  }

  async waitUntilChangeSetIsReady(
    stackName: string,
    changeSetName: string,
  ): Promise<DescribeChangeSetOutput | null> {
    const response = await this.describeChangeSet(stackName, changeSetName)
    switch (response.Status) {
      case "CREATE_COMPLETE":
        return response
      case "DELETE_COMPLETE":
        throw new Error(`Unexpected change set status: ${response.Status}`)
      case "CREATE_IN_PROGRESS":
      case "CREATE_PENDING":
        await sleep(1000)
        return this.waitUntilChangeSetIsReady(stackName, changeSetName)
      case "FAILED":
        return null
      default:
        throw new Error(`Unsupported change set status: ${response.Status}`)
    }
  }

  describeStackEvents = async (
    stackName: string,
  ): Promise<CloudFormation.StackEvent[]> =>
    this.withClient((c) =>
      this.pagedOperation(
        (params) => c.describeStackEvents(params),
        { StackName: stackName },
        (response) => response.StackEvents!,
      ),
    )

  cancelStackUpdate = async (stackName: string): Promise<string> => {
    const params = {
      StackName: stackName,
      ClientRequestToken: uuid.v4(),
    }

    return this.withClientPromise(
      (c) => c.cancelUpdateStack(params),
      () => params.ClientRequestToken,
    )
  }

  createStack = async (params: CreateStackInput): Promise<string> =>
    this.withClientPromise(
      (c) => c.createStack(params),
      (res) => res.StackId!,
    )

  updateStack = async (params: UpdateStackInput): Promise<boolean> =>
    this.withClientPromise(
      (c) => c.updateStack(params),
      () => true,
      (e) => {
        if (
          e.code === "ValidationError" &&
          e.message === "No updates are to be performed."
        ) {
          return false
        }

        throw e
      },
    )

  waitUntilStackCreateOrUpdateCompletes = async (
    stackName: string,
    clientRequestToken: string,
    eventListener: (event: CloudFormation.StackEvent) => void,
    timeoutConfig: TimeoutConfig,
    latestEventId: string | null = null,
    allEvents: CloudFormation.StackEvent[] = [],
  ): Promise<ChangeSetCompletionResponse> => {
    await sleep(1000)

    const cfStack = await this.describeStack(stackName)
    if (cfStack === null) {
      throw new Error(
        `Stack ${stackName} with name ${stackName} does not exists`,
      )
    }

    const events = (await this.describeStackEvents(cfStack.StackId!)).reverse()
    const newEvents = takeRightWhile(
      events,
      (e) => e.EventId !== latestEventId,
    ).filter((e) => e.ClientRequestToken === clientRequestToken)

    newEvents.forEach(eventListener)

    const updatedEvents = [...allEvents, ...newEvents]

    switch (cfStack.StackStatus) {
      case "CREATE_COMPLETE":
      case "DELETE_COMPLETE":
      case "ROLLBACK_COMPLETE":
      case "UPDATE_COMPLETE":
      case "ROLLBACK_FAILED":
      case "CREATE_FAILED":
      case "DELETE_FAILED":
      case "UPDATE_ROLLBACK_COMPLETE":
      case "UPDATE_ROLLBACK_FAILED":
        return {
          events: updatedEvents,
          stackStatus: cfStack.StackStatus,
          timeoutConfig,
        }
      default:
        const latestEvent = last(events)
        const newLatestEventId = latestEvent
          ? latestEvent.EventId
          : latestEventId

        if (timeoutConfig.timeout !== 0) {
          const elapsedTime = Date.now() - timeoutConfig.startTime
          if (elapsedTime > timeoutConfig.timeout * 1000) {
            if (cfStack.StackStatus === "UPDATE_IN_PROGRESS") {
              const cancelClientToken = await this.cancelStackUpdate(stackName)
              return this.waitUntilStackCreateOrUpdateCompletes(
                stackName,
                cancelClientToken,
                eventListener,
                {
                  timeout: 0,
                  timeoutOccurred: true,
                  startTime: timeoutConfig.startTime,
                },
                newLatestEventId,
                updatedEvents,
              )
            } else {
              console.log(
                `Timeout exceeded but stack update can't be cancelled because stack status ${cfStack.StackStatus} != UPDATE_IN_PROGRESS`,
              )
            }
          }
        }

        return this.waitUntilStackCreateOrUpdateCompletes(
          stackName,
          clientRequestToken,
          eventListener,
          timeoutConfig,
          newLatestEventId,
          updatedEvents,
        )
    }
  }

  waitUntilStackIsDeleted = async (
    stackName: string,
    stackArn: string,
    clientRequestToken: string,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    eventListener: (event: CloudFormation.StackEvent) => void = () => {},
    latestEventId: string | null = null,
    allEvents: CloudFormation.StackEvent[] = [],
  ): Promise<StackDeleteCompletionResponse> => {
    await sleep(1000)

    const cfStack = await this.describeStack(stackArn)
    if (cfStack === null) {
      throw new Error(`Stack ${stackName} with arn ${stackArn} does not exists`)
    }

    const events = (await this.describeStackEvents(stackArn)).reverse()

    const newEvents = takeRightWhile(
      events,
      (e) => e.EventId !== latestEventId,
    ).filter((e) => e.ClientRequestToken === clientRequestToken)

    newEvents.forEach(eventListener)

    const updatedEvents = [...allEvents, ...newEvents]

    switch (cfStack.StackStatus) {
      case "DELETE_COMPLETE":
      case "DELETE_FAILED":
        return Promise.resolve({
          events: updatedEvents,
          stackStatus: cfStack.StackStatus,
        })
      default:
        const latestEvent = last(events)
        const newLatestEventId = latestEvent
          ? latestEvent.EventId
          : latestEventId
        return this.waitUntilStackIsDeleted(
          stackName,
          stackArn,
          clientRequestToken,
          eventListener,
          newLatestEventId,
          updatedEvents,
        )
    }
  }
}

export interface TimeoutConfig {
  startTime: number
  timeout: number
  timeoutOccurred: boolean
}

export interface ChangeSetCompletionResponse {
  events: CloudFormation.StackEvent[]
  stackStatus: CloudFormation.StackStatus
  timeoutConfig: TimeoutConfig
}

export interface StackDeleteCompletionResponse {
  events: CloudFormation.StackEvent[]
  stackStatus: CloudFormation.StackStatus
}
