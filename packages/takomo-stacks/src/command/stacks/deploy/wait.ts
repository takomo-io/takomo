import { CommandStatus } from "@takomo/core"
import CloudFormation from "aws-sdk/clients/cloudformation"
import { StackResult, StackResultReason } from "../../../model"
import { describeExistingCloudFormationStack } from "./describe"
import { executeAfterLaunchHooks, executeBeforeLaunchHooks } from "./hooks"
import {
  ClientTokenHolder,
  DeleteStackClientTokenHolder,
  InitialLaunchContext,
  StackLaunchType,
} from "./model"

export const isStackDeletedSuccessfully = (
  stackStatus: CloudFormation.StackStatus,
): boolean => "DELETE_COMPLETE" === stackStatus

export const waitForDependenciesToComplete = async (
  initial: InitialLaunchContext,
): Promise<StackResult> => {
  const { stack, dependencies, watch, logger } = initial
  const childWatch = watch.startChild("wait-dependencies")

  logger.debug(`Wait ${dependencies.length} dependencies to complete`)

  try {
    const dependencyResults = await Promise.all(dependencies)

    const allDependenciesSucceeded =
      dependencyResults.find((r) => !r.success) === undefined

    if (!allDependenciesSucceeded) {
      logger.debug("Some dependencies failed")
      return {
        stack,
        message: "Dependencies failed",
        reason: "DEPENDENCIES_FAILED",
        status: CommandStatus.CANCELLED,
        events: [],
        success: false,
        watch: watch.stop(),
      }
    }

    childWatch.stop()

    logger.debug("Dependencies completed successfully")
    return describeExistingCloudFormationStack(initial)
  } catch (e) {
    logger.error("An error occurred while waiting dependencies to complete", e)

    return {
      stack,
      message: e.message,
      reason: "DEPENDENCIES_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }
}

export const waitStackDeletionToComplete = async (
  holder: DeleteStackClientTokenHolder,
): Promise<StackResult> => {
  const {
    stack,
    current,
    cloudFormationClient,
    io,
    watch,
    clientToken,
    logger,
  } = holder

  logger.debug("Wait for delete to complete")
  const childWatch = watch.startChild("wait-stack-deletion")

  try {
    const {
      events,
      stackStatus,
    } = await cloudFormationClient.waitUntilStackIsDeleted(
      stack.getName(),
      current.stackId,
      clientToken,
      (e: CloudFormation.StackEvent) => io.printStackEvent(stack.getPath(), e),
    )

    if (!isStackDeletedSuccessfully(stackStatus)) {
      logger.debug("Failed to delete stack")
      return {
        stack,
        message: "Stack deletion failed",
        reason: "DELETE_STACK_FAILED",
        status: CommandStatus.FAILED,
        events,
        success: false,
        watch: watch.stop(),
      }
    }

    childWatch.stop()
    logger.debug("Stack deleted successfully")

    return await executeBeforeLaunchHooks({
      ...holder,
      launchType: StackLaunchType.CREATE,
    })
  } catch (e) {
    logger.error("Failed to delete stack", e)
    return {
      stack,
      message: "Stack deletion failed",
      reason: "DELETE_STACK_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }
}

export const waitForStackCreateOrUpdateToComplete = async (
  holder: ClientTokenHolder,
): Promise<StackResult> => {
  const {
    stack,
    cloudFormationClient,
    clientToken,
    launchType,
    io,
    watch,
    logger,
  } = holder

  const childWatch = watch.startChild("wait-update-completion")

  logger.debug("Wait for stack launch to complete")

  const resolveReason = (success: boolean): StackResultReason => {
    if (launchType === StackLaunchType.UPDATE && success)
      return "UPDATE_SUCCESS"
    else if (launchType === StackLaunchType.UPDATE && !success)
      return "UPDATE_FAILED"
    else if (launchType === StackLaunchType.CREATE && success)
      return "CREATE_SUCCESS"
    else return "CREATE_FAILED"
  }

  const timeout =
    launchType === StackLaunchType.UPDATE ? stack.getTimeout().update : 0

  try {
    const {
      stackStatus,
      events,
    } = await cloudFormationClient.waitUntilStackCreateOrUpdateCompletes(
      stack.getName(),
      clientToken,
      (e: CloudFormation.StackEvent) => io.printStackEvent(stack.getPath(), e),
      {
        timeout,
        startTime: Date.now(),
        timeoutOccurred: false,
      },
    )

    logger.info(`Stack launch completed with status: ${stackStatus}`)

    childWatch.stop()

    const success =
      stackStatus === "UPDATE_COMPLETE" || stackStatus === "CREATE_COMPLETE"
    const message = success ? "Success" : "Failure"
    const status = success ? CommandStatus.SUCCESS : CommandStatus.FAILED
    const reason = resolveReason(success)
    const result = {
      stack,
      message,
      reason,
      status,
      events,
      success,
      watch: watch.stop(),
    }

    return executeAfterLaunchHooks({ ...holder, result })
  } catch (e) {
    logger.error("Failed to wait for stack launch to complete", e)
    return {
      stack,
      message: e.message,
      reason: "ERROR",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }
}
