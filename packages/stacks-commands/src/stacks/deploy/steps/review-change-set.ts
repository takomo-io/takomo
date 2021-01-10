import uuid from "uuid"
import { StackOperationStep } from "../../common/steps"
import { ChangeSetHolder } from "../states"

/**
 * @hidden
 */
export const reviewChangeSet: StackOperationStep<ChangeSetHolder> = async (
  input,
) => {
  const {
    stack,
    changeSet,
    templateBody,
    currentStack,
    io,
    templateSummary,
    logger,
    changeSetName,
    state,
    transitions,
  } = input

  const answer = await io.confirmStackDeploy(
    stack,
    templateBody,
    templateSummary,
    currentStack,
    changeSet,
  )

  const cloudFormationClient = stack.getCloudFormationClient()

  if (answer === "CANCEL") {
    if (changeSet && !currentStack) {
      logger.info("Clean up temporary stack")
      await cloudFormationClient.initiateStackDeletion({
        StackName: stack.name,
      })
      await cloudFormationClient.waitUntilStackIsDeleted(
        stack.name,
        changeSet.stackId,
        uuid.v4(),
      )
      logger.debug("Temporary stack deleted successfully")
    } else {
      logger.debug("Delete change set")
      await cloudFormationClient.deleteChangeSet(stack.name, changeSetName)
    }

    return transitions.cancelStackOperation({ ...input, message: "Cancelled" })
  }

  if (answer === "CONTINUE_AND_SKIP_REMAINING_REVIEWS") {
    state.autoConfirm = true
  }

  if (changeSet && !currentStack) {
    logger.debug("Initiate deletion of the created temporary stack")
    await cloudFormationClient.initiateStackDeletion({
      StackName: stack.name,
    })
    await cloudFormationClient.waitUntilStackIsDeleted(
      stack.name,
      changeSet.stackId,
      uuid.v4(),
    )
    logger.debug("Temporary stack deleted successfully")
  } else {
    logger.debug("Delete change set")
    await cloudFormationClient.deleteChangeSet(stack.name, changeSetName)
  }

  return transitions.initiateStackCreateOrUpdate(input)
}
