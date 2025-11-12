import { uuid } from "../../../../../utils/strings.js"
import { StackOperationStep } from "../../../common/steps.js"
import { ChangeSetHolder } from "../states.js"

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
    operationType,
  } = input

  const answer = await io.confirmStackDeploy(
    stack,
    templateBody,
    templateSummary,
    operationType,
    currentStack,
    changeSet,
  )

  const cloudFormationClient = await stack.getCloudFormationClient()

  if (answer === "CANCEL") {
    if (changeSet && !currentStack) {
      logger.info("Clean up temporary stack")
      const clientToken = uuid()

      await cloudFormationClient.initiateStackDeletion({
        StackName: stack.name,
        ClientRequestToken: clientToken,
      })

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const eventListener = () => {}

      await cloudFormationClient.waitStackDeleteToComplete({
        stackId: changeSet.stackId,
        clientToken,
        eventListener,
      })

      logger.debug("Temporary stack deleted successfully")
    } else {
      logger.debug("Delete change set")
      await cloudFormationClient.deleteChangeSet(stack.name, changeSetName)
    }

    return transitions.executeAfterDeployHooks({
      ...input,
      message: "Cancelled",
      status: "CANCELLED",
      success: false,
      events: [],
    })
  }

  if (answer === "CONTINUE_AND_SKIP_REMAINING_REVIEWS") {
    state.autoConfirm = true
  }

  if (changeSet && !currentStack) {
    logger.debug("Initiate deletion of the created temporary stack")
    const clientToken = uuid()
    await cloudFormationClient.initiateStackDeletion({
      StackName: stack.name,
      ClientRequestToken: clientToken,
    })

    await cloudFormationClient.waitStackDeleteToComplete({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      eventListener: () => {},
      stackId: changeSet.stackId,
      clientToken,
    })

    logger.debug("Temporary stack deleted successfully")
  } else {
    logger.debug("Delete change set")
    await cloudFormationClient.deleteChangeSet(stack.name, changeSetName)
  }

  return transitions.initiateStackCreateOrUpdate(input)
}
