import {
  CustomStackChange,
  GetChangesResult,
} from "../../../../../custom-stacks/custom-stack-handler.js"
import { TakomoError } from "../../../../../utils/errors.js"
import { indentLines } from "../../../../../utils/strings.js"
import { StackOperationStep } from "../../../common/steps.js"
import { TagsHolder } from "../states.js"

export class UnexpectedChangesInCustomStackError extends TakomoError {
  constructor(changes: ReadonlyArray<CustomStackChange>) {
    let message = "Stack has unexpected changes:\n\n"
    message += `- Changes:\n\n${indentLines(
      JSON.stringify(changes, undefined, 2),
    )}\n\n`

    super(message)
  }
}

const getChangesInternal = async ({
  customStackHandler,
  logger,
  stack,
  currentState,
  ctx,
  parameters,
  tags,
}: TagsHolder): Promise<GetChangesResult> => {
  if (!customStackHandler.getChanges) {
    logger.debug(
      `Custom stack handler '${customStackHandler.type}' does not implement getChanges(), assuming changes are present`,
    )

    return {
      success: true,
      changes: [{ description: "Changes present but no details available" }],
    }
  }

  try {
    return await customStackHandler.getChanges({
      config: stack.customConfig,
      currentState,
      logger,
      parameters,
      tags,
      ctx,
      stack,
    })
  } catch (e) {
    logger.error("Failed to get custom stack changes", e)
    return {
      success: false,
      message: "Failed to get custom stack changes",
      error: e as Error,
    }
  }
}

export const getChanges: StackOperationStep<TagsHolder> = async (state) => {
  const { transitions, expectNoChanges, logger } = state

  const result = await getChangesInternal(state)

  if (!result.success) {
    logger.error("Failed to get custom stack changes", result.error)

    return transitions.failStackOperation({
      ...state,
      error: result.error,
      events: [],
      message: result.message ?? "Failed to get changes",
    })
  }

  const changes = result.changes ?? []
  if (changes.length === 0) {
    logger.info("Stack contains no changes")
    return transitions.completeStackOperation({
      ...state,
      message: "No changes",
      status: "SUCCESS",
      events: [],
      success: true,
    })
  }

  if (expectNoChanges && changes.length > 0) {
    return transitions.failStackOperation({
      ...state,
      message: "Stack has unexpected changes",
      events: [],
      error: new UnexpectedChangesInCustomStackError(changes),
    })
  }

  const updatedState = {
    ...state,
    changes,
  }

  if (state.state.autoConfirm) {
    return transitions.createOrUpdateStack(updatedState)
  }

  return transitions.reviewDeployment(updatedState)
}
