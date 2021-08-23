import {
  ChangeSet,
  ClientRequestToken,
  CloudFormationStack,
  DetailedCloudFormationStack,
  EventId,
  isTerminalResourceStatus,
  ResourceStatus,
  StackDriftDetectionId,
  StackDriftDetectionStatusOutput,
  StackEvent,
  StackId,
  StackName,
  StackPolicyBody,
  TemplateSummary,
} from "@takomo/aws-model"
import { arrayToMap, sleep, uuid } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import {
  CreateChangeSetInput,
  CreateStackInput,
  DeleteStackInput,
  UpdateStackInput,
  ValidateTemplateInput,
} from "aws-sdk/clients/cloudformation"
import { IPolicy } from "cockatiel"
import takeRightWhile from "lodash.takerightwhile"
import R from "ramda"
import { AwsClientProps, createClient } from "../common/client"
import {
  convertChangeSet,
  convertStack,
  convertStackDriftDetectionStatus,
  convertStackEvents,
  convertStacks,
  convertTemplateSummary,
} from "./convert"
import { evaluateDescribeChangeSet } from "./rules/describe-change-set-rule"

export interface CloudFormationClient {
  readonly validateTemplate: (input: ValidateTemplateInput) => Promise<boolean>

  readonly describeStack: (
    stackName: string,
  ) => Promise<CloudFormationStack | undefined>

  readonly describeStacks: (
    stackNames: ReadonlyArray<StackName>,
  ) => Promise<Map<StackName, CloudFormationStack>>

  readonly enrichStack: (
    stack: CloudFormationStack,
  ) => Promise<DetailedCloudFormationStack>

  readonly getTemplateSummary: (
    input: CloudFormation.GetTemplateSummaryInput,
  ) => Promise<TemplateSummary>

  readonly getCurrentTemplate: (stackName: string) => Promise<string>

  readonly initiateStackDeletion: (input: DeleteStackInput) => Promise<boolean>

  readonly createChangeSet: (
    params: CreateChangeSetInput,
  ) => Promise<CloudFormation.ChangeSetId>

  readonly deleteChangeSet: (
    stackName: string,
    changeSetName: string,
  ) => Promise<boolean>

  readonly describeChangeSet: (
    stackName: string,
    changeSetName: string,
  ) => Promise<ChangeSet>

  readonly waitUntilChangeSetIsReady: (
    stackName: string,
    changeSetName: string,
  ) => Promise<ChangeSet | undefined>

  readonly describeStackEvents: (
    stackName: string,
  ) => Promise<ReadonlyArray<StackEvent>>

  readonly cancelStackUpdate: (stackName: string) => Promise<string>

  readonly createStack: (params: CreateStackInput) => Promise<StackId>

  readonly updateStack: (params: UpdateStackInput) => Promise<boolean>

  readonly updateTerminationProtection: (
    stackName: string,
    enable: boolean,
  ) => Promise<boolean>

  /**
   * Replaced with waitStackDeployToComplete.
   *
   * To be removed in Takomo 4.0.0.
   *
   * @deprecated
   */
  readonly waitUntilStackCreateOrUpdateCompletes: (
    stackName: string,
    clientRequestToken: string,
    eventListener: (event: StackEvent) => void,
    timeoutConfig: TimeoutConfig,
    latestEventId?: string,
    allEvents?: ReadonlyArray<StackEvent>,
  ) => Promise<ChangeSetCompletionResponse>

  /**
   * Replaced with waitStackDeleteToComplete.
   *
   * To be removed in Takomo 4.0.0.
   *
   * @deprecated
   */
  readonly waitUntilStackIsDeleted: (
    stackName: string,
    stackArn: string,
    clientRequestToken: string,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    eventListener?: (event: StackEvent) => void,
    latestEventId?: string,
    allEvents?: ReadonlyArray<StackEvent>,
  ) => Promise<StackDeleteCompletionResponse>

  readonly getNativeClient: () => Promise<CloudFormation>

  readonly waitStackDeployToComplete: (
    props: WaitStackDeployToCompleteProps,
  ) => Promise<WaitStackDeployToCompleteResponse>

  readonly waitStackDeleteToComplete: (
    props: WaitStackDeleteToCompleteProps,
  ) => Promise<WaitStackDeleteToCompleteResponse>

  readonly getStackPolicy: (
    stackName: string,
  ) => Promise<StackPolicyBody | undefined>

  readonly detectDrift: (stackName: StackName) => Promise<StackDriftDetectionId>

  readonly describeStackDriftDetectionStatus: (
    id: StackDriftDetectionId,
  ) => Promise<StackDriftDetectionStatusOutput>

  readonly waitDriftDetectionToComplete: (
    id: StackDriftDetectionId,
  ) => Promise<StackDriftDetectionStatusOutput>
}

const findTerminalEvent = (
  stackId: StackId,
  events: ReadonlyArray<StackEvent>,
): StackEvent | undefined =>
  events.find(
    ({ resourceType, physicalResourceId, resourceStatus }) =>
      resourceType === "AWS::CloudFormation::Stack" &&
      physicalResourceId === stackId &&
      isTerminalResourceStatus(resourceStatus),
  )

interface CloudFormationClientProps extends AwsClientProps {
  readonly describeEventsBulkhead: IPolicy
  readonly waitStackDeployToCompletePollInterval: number
  readonly waitStackDeleteToCompletePollInterval: number
}

/**
 * @hidden
 */
export const createCloudFormationClient = (
  props: CloudFormationClientProps,
): CloudFormationClient => {
  const {
    withClientPromise,
    pagedOperationBulkhead,
    pagedOperationV2,
    withClient,
    getClient,
  } = createClient({
    ...props,
    clientConstructor: (config) => new CloudFormation(config),
  })

  const {
    logger,
    describeEventsBulkhead,
    waitStackDeployToCompletePollInterval,
    waitStackDeleteToCompletePollInterval,
  } = props

  const getStackPolicy = (
    stackName: string,
  ): Promise<StackPolicyBody | undefined> =>
    withClientPromise(
      (c) => c.getStackPolicy({ StackName: stackName }),
      (r) => r.StackPolicyBody!,
    )

  const detectDrift = (stackName: StackName): Promise<StackDriftDetectionId> =>
    withClientPromise(
      (c) => c.detectStackDrift({ StackName: stackName }),
      (r) => r.StackDriftDetectionId,
    )

  const describeStackDriftDetectionStatus = (
    id: StackDriftDetectionId,
  ): Promise<StackDriftDetectionStatusOutput> =>
    withClientPromise(
      (c) => c.describeStackDriftDetectionStatus({ StackDriftDetectionId: id }),
      convertStackDriftDetectionStatus,
    )

  const waitDriftDetectionToComplete = async (
    id: StackDriftDetectionId,
  ): Promise<StackDriftDetectionStatusOutput> => {
    const status = await describeStackDriftDetectionStatus(id)
    switch (status.detectionStatus) {
      case "DETECTION_COMPLETE":
      case "DETECTION_FAILED":
        return status
      default:
        await sleep(5000)
        return waitDriftDetectionToComplete(id)
    }
  }

  const validateTemplate = (input: ValidateTemplateInput): Promise<boolean> =>
    withClientPromise(
      (c) => c.validateTemplate(input),
      () => true,
    )

  const describeStack = (
    stackName: string,
  ): Promise<CloudFormationStack | undefined> =>
    withClientPromise(
      (c) => c.describeStacks({ StackName: stackName }),
      convertStack,
      (e) => {
        if (e.code === "ValidationError") {
          if (e.message === `Stack with id ${stackName} does not exist`) {
            return undefined
          }
        }

        throw e
      },
    )

  const describeStacks = (
    stackNames: ReadonlyArray<StackName>,
  ): Promise<Map<StackName, CloudFormationStack>> => {
    const collectedNames = new Set<StackName>()
    return withClient((c) =>
      pagedOperationV2({
        operation: (params) => c.describeStacks(params),
        params: {},
        extractor: convertStacks,
        filter: (s) => stackNames.includes(s.name),
        onPage: (items) => {
          items.forEach((item) => collectedNames.add(item.name))
          return stackNames.every((s) => collectedNames.has(s))
        },
      }),
    ).then((stacks) => new Map(arrayToMap(stacks, (s) => s.name)))
  }

  const enrichStack = async (
    stack: CloudFormationStack,
  ): Promise<DetailedCloudFormationStack> => {
    const [summary, templateBody, stackPolicyBody] = await Promise.all([
      getTemplateSummary({
        StackName: stack.name,
      }),
      getCurrentTemplate(stack.name),
      getStackPolicy(stack.name),
    ])

    const parameterMap = new Map(stack.parameters.map((p) => [p.key, p]))
    const parameters = summary.parameters.map((declaration) => {
      const stackParam = parameterMap.get(declaration.key)
      if (!stackParam) {
        throw new Error(`Parameter '${declaration.key}' not found`)
      }

      return {
        ...stackParam,
        ...declaration,
      }
    })

    return {
      ...stack,
      templateBody,
      stackPolicyBody,
      parameters,
    }
  }

  const getTemplateSummary = (
    input: CloudFormation.GetTemplateSummaryInput,
  ): Promise<TemplateSummary> =>
    withClientPromise(
      (c) => c.getTemplateSummary(input),
      convertTemplateSummary,
    )

  const getCurrentTemplate = (stackName: string): Promise<string> =>
    withClientPromise(
      (c) => c.getTemplate({ StackName: stackName, TemplateStage: "Original" }),
      (res) => res.TemplateBody!,
    )

  const initiateStackDeletion = (input: DeleteStackInput): Promise<boolean> =>
    withClientPromise(
      (c) => c.deleteStack(input),
      () => true,
    )

  const createChangeSet = (
    params: CreateChangeSetInput,
  ): Promise<CloudFormation.ChangeSetId> =>
    withClientPromise(
      (c) => c.createChangeSet(params),
      (res) => res.Id!,
    )

  const deleteChangeSet = (
    stackName: string,
    changeSetName: string,
  ): Promise<boolean> => {
    const params = {
      StackName: stackName,
      ChangeSetName: changeSetName,
    }

    return withClientPromise(
      (c) => c.deleteChangeSet(params),
      () => true,
    )
  }

  const describeChangeSet = (
    stackName: string,
    changeSetName: string,
  ): Promise<ChangeSet> => {
    const params = {
      ChangeSetName: changeSetName,
      StackName: stackName,
    }

    return withClientPromise(
      (c) => c.describeChangeSet(params),
      convertChangeSet,
    )
  }

  const waitUntilChangeSetIsReady = async (
    stackName: string,
    changeSetName: string,
  ): Promise<ChangeSet | undefined> => {
    const changeSet = await describeChangeSet(stackName, changeSetName)
    const result = evaluateDescribeChangeSet(changeSet)
    switch (result) {
      case "ERROR":
        throw new Error(
          `Could not evaluate change set with status: ${changeSet.status}, reason: ${changeSet.statusReason}`,
        )
      case "NO_CHANGES":
        return undefined
      case "FAILED":
        throw new Error(changeSet.statusReason)
      case "PENDING":
        await sleep(1000)
        return waitUntilChangeSetIsReady(stackName, changeSetName)
      case "READY":
        return changeSet
    }
  }

  const describeStackEvents = (
    stackName: string,
  ): Promise<ReadonlyArray<StackEvent>> =>
    withClient((c) =>
      pagedOperationBulkhead(
        describeEventsBulkhead,
        (params) => c.describeStackEvents(params),
        { StackName: stackName },
        convertStackEvents,
      ),
    )

  const cancelStackUpdate = (stackName: string): Promise<string> => {
    const params = {
      StackName: stackName,
      ClientRequestToken: uuid(),
    }

    return withClientPromise(
      (c) => c.cancelUpdateStack(params),
      () => params.ClientRequestToken,
    )
  }

  const createStack = (params: CreateStackInput): Promise<StackId> =>
    withClientPromise(
      (c) => c.createStack(params),
      (res) => res.StackId!,
    )

  const updateStack = (params: UpdateStackInput): Promise<boolean> =>
    withClientPromise(
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

  const updateTerminationProtection = (
    stackName: string,
    enable: boolean,
  ): Promise<boolean> =>
    withClientPromise(
      (c) =>
        c.updateTerminationProtection({
          EnableTerminationProtection: enable,
          StackName: stackName,
        }),
      () => true,
    )

  const waitUntilStackCreateOrUpdateCompletes = async (
    stackName: string,
    clientRequestToken: string,
    eventListener: (event: StackEvent) => void,
    timeoutConfig: TimeoutConfig,
    latestEventId: string | null = null,
    allEvents: ReadonlyArray<StackEvent> = [],
  ): Promise<ChangeSetCompletionResponse> => {
    await sleep(2000)

    const stack = await describeStack(stackName)
    if (stack === undefined) {
      throw new Error(
        `Stack ${stackName} with name ${stackName} does not exists`,
      )
    }

    const events = (await describeStackEvents(stack.id)).slice().reverse()
    const newEvents = takeRightWhile(
      events,
      (e) => e.id !== latestEventId,
    ).filter((e) => e.clientRequestToken === clientRequestToken)

    newEvents.forEach(eventListener)

    const updatedEvents = [...allEvents, ...newEvents]

    switch (stack.status) {
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
          stackStatus: stack.status,
          timeoutConfig,
        }
      default:
        const latestEvent = R.last(events)
        const newLatestEventId = latestEvent ? latestEvent.id : latestEventId

        if (timeoutConfig.timeout !== 0) {
          const elapsedTime = Date.now() - timeoutConfig.startTime
          if (elapsedTime > timeoutConfig.timeout * 1000) {
            if (stack.status === "UPDATE_IN_PROGRESS") {
              const cancelClientToken = await cancelStackUpdate(stackName)
              return waitUntilStackCreateOrUpdateCompletes(
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
                `Timeout exceeded but stack update can't be cancelled because stack status ${stack.status} != UPDATE_IN_PROGRESS`,
              )
            }
          }
        }

        return waitUntilStackCreateOrUpdateCompletes(
          stackName,
          clientRequestToken,
          eventListener,
          timeoutConfig,
          newLatestEventId,
          updatedEvents,
        )
    }
  }

  const waitStackDeployToComplete = async (
    props: WaitStackDeployToCompleteProps,
  ): Promise<WaitStackDeployToCompleteResponse> => {
    const {
      stackId,
      clientToken,
      eventListener,
      timeoutConfig,
      allEvents = [],
      latestEventId,
    } = props

    await sleep(waitStackDeployToCompletePollInterval)

    const events = (await describeStackEvents(stackId)).slice().reverse()
    const newEvents = takeRightWhile(
      events,
      (e) => e.id !== latestEventId,
    ).filter((e) => e.clientRequestToken === clientToken)

    newEvents.forEach(eventListener)

    const updatedEvents = [...allEvents, ...newEvents]
    const terminalEvent = findTerminalEvent(stackId, updatedEvents)

    if (terminalEvent) {
      return {
        timeoutConfig,
        events: updatedEvents,
        stackStatus: terminalEvent.resourceStatus,
      }
    }

    const latestEvent = R.last(events)
    const newLatestEventId = latestEvent ? latestEvent.id : latestEventId

    if (timeoutConfig.timeout !== 0) {
      const elapsedTime = Date.now() - timeoutConfig.startTime
      if (elapsedTime > timeoutConfig.timeout * 1000) {
        const latestStackEvent = R.last(
          updatedEvents.filter(
            ({ resourceType, physicalResourceId }) =>
              resourceType === "AWS::CloudFormation::Stack" &&
              physicalResourceId === stackId,
          ),
        )

        if (!latestStackEvent) {
          throw new Error(`Expected latest event to exist for stack ${stackId}`)
        }

        if (latestStackEvent.resourceStatus === "UPDATE_IN_PROGRESS") {
          const cancelToken = await cancelStackUpdate(stackId)
          return waitStackDeployToComplete({
            ...props,
            clientToken: cancelToken,
            allEvents: updatedEvents,
            latestEventId: newLatestEventId,
            timeoutConfig: {
              timeout: 0,
              timeoutOccurred: true,
              startTime: timeoutConfig.startTime,
            },
          })
        } else {
          logger.warn(
            `Timeout exceeded for stack ${stackId} but update can't be cancelled because stack status ${latestStackEvent.resourceStatus} != UPDATE_IN_PROGRESS`,
          )
        }
      }
    }

    return waitStackDeployToComplete({
      ...props,
      allEvents: updatedEvents,
      latestEventId: newLatestEventId,
    })
  }

  const waitUntilStackIsDeleted = async (
    stackName: string,
    stackArn: string,
    clientRequestToken: string,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    eventListener: (event: StackEvent) => void = () => {},
    latestEventId: string | null = null,
    allEvents: ReadonlyArray<StackEvent> = [],
  ): Promise<StackDeleteCompletionResponse> => {
    await sleep(2000)

    const stack = await describeStack(stackArn)
    if (stack === undefined) {
      throw new Error(`Stack ${stackName} with arn ${stackArn} does not exists`)
    }

    const events = (await describeStackEvents(stackArn)).slice().reverse()

    const newEvents = takeRightWhile(
      events,
      (e) => e.id !== latestEventId,
    ).filter((e) => e.clientRequestToken === clientRequestToken)

    newEvents.forEach(eventListener)

    const updatedEvents = [...allEvents, ...newEvents]

    switch (stack.status) {
      case "DELETE_COMPLETE":
      case "DELETE_FAILED":
        return {
          events: updatedEvents,
          stackStatus: stack.status,
        }
      default:
        const latestEvent = R.last(events)
        const newLatestEventId = latestEvent ? latestEvent.id : latestEventId
        return waitUntilStackIsDeleted(
          stackName,
          stackArn,
          clientRequestToken,
          eventListener,
          newLatestEventId,
          updatedEvents,
        )
    }
  }

  const waitStackDeleteToComplete = async (
    props: WaitStackDeleteToCompleteProps,
  ): Promise<WaitStackDeleteToCompleteResponse> => {
    const {
      stackId,
      latestEventId,
      clientToken,
      eventListener,
      allEvents = [],
    } = props

    await sleep(waitStackDeleteToCompletePollInterval)

    const events = (await describeStackEvents(stackId)).slice().reverse()

    const newEvents = takeRightWhile(
      events,
      (e) => e.id !== latestEventId,
    ).filter((e) => e.clientRequestToken === clientToken)

    newEvents.forEach(eventListener)

    const updatedEvents = [...allEvents, ...newEvents]
    const terminalEvent = findTerminalEvent(stackId, updatedEvents)

    if (terminalEvent) {
      return {
        events: updatedEvents,
        stackStatus: terminalEvent.resourceStatus,
      }
    }

    const latestEvent = R.last(events)
    const newLatestEventId = latestEvent ? latestEvent.id : latestEventId
    return waitStackDeleteToComplete({
      ...props,
      latestEventId: newLatestEventId,
      allEvents: updatedEvents,
    })
  }

  return {
    validateTemplate,
    describeStack,
    describeStacks,
    enrichStack,
    getTemplateSummary,
    getCurrentTemplate,
    initiateStackDeletion,
    createChangeSet,
    deleteChangeSet,
    describeChangeSet,
    waitUntilChangeSetIsReady,
    describeStackEvents,
    cancelStackUpdate,
    createStack,
    updateStack,
    updateTerminationProtection,
    waitUntilStackCreateOrUpdateCompletes,
    waitStackDeployToComplete,
    waitUntilStackIsDeleted,
    waitStackDeleteToComplete,
    getStackPolicy,
    detectDrift,
    describeStackDriftDetectionStatus,
    waitDriftDetectionToComplete,
    getNativeClient: getClient,
  }
}

/**
 * @hidden
 */
export interface TimeoutConfig {
  readonly startTime: number
  readonly timeout: number
  readonly timeoutOccurred: boolean
}

/**
 * @hidden
 */
export interface ChangeSetCompletionResponse {
  readonly events: ReadonlyArray<StackEvent>
  readonly stackStatus: CloudFormation.StackStatus
  readonly timeoutConfig: TimeoutConfig
}

/**
 * @hidden
 */
export interface WaitStackDeployToCompleteResponse {
  readonly events: ReadonlyArray<StackEvent>
  readonly stackStatus: ResourceStatus
  readonly timeoutConfig: TimeoutConfig
}

/**
 * @hidden
 */
export interface WaitStackDeployToCompleteProps {
  readonly stackId: StackId
  readonly clientToken: ClientRequestToken
  readonly eventListener: (event: StackEvent) => void
  readonly timeoutConfig: TimeoutConfig
  readonly allEvents?: ReadonlyArray<StackEvent>
  readonly latestEventId?: EventId
}

/**
 * @hidden
 */
export interface WaitStackDeleteToCompleteResponse {
  readonly events: ReadonlyArray<StackEvent>
  readonly stackStatus: ResourceStatus
}

/**
 * @hidden
 */
export interface WaitStackDeleteToCompleteProps {
  readonly stackId: StackId
  readonly clientToken: ClientRequestToken
  readonly eventListener: (event: StackEvent) => void
  readonly allEvents?: ReadonlyArray<StackEvent>
  readonly latestEventId?: EventId
}

/**
 * @hidden
 */
export interface StackDeleteCompletionResponse {
  readonly events: ReadonlyArray<StackEvent>
  readonly stackStatus: CloudFormation.StackStatus
}
