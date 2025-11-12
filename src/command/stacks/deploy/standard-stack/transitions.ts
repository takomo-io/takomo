import { StackOperationStep } from "../../common/steps.js"
import {
  defaultStackOperationTransitions,
  inProgress,
  StackOperationTransitions,
} from "../../common/transitions.js"
import { resolveResultMessage } from "../common.js"
import {
  ChangeSetHolder,
  ChangeSetNameHolder,
  ContinueStackRollbackClientTokenHolder,
  CurrentStackHolder,
  DeleteFailedStackClientTokenHolder,
  DetailedCurrentStackHolder,
  InitialDeployStackState,
  ParametersHolder,
  StackOperationClientTokenHolder,
  StackOperationResultHolder,
  TagsHolder,
  TemplateBodyHolder,
  TemplateLocationHolder,
  TemplateSummaryHolder,
  UpdateStackHolder,
} from "./states.js"
import { continueUpdateRollback } from "./steps/continue-update-rollback.js"
import { enrichCurrentStack } from "./steps/enrich-current-stack.js"
import { executeAfterDeployHooks } from "./steps/execute-after-deploy-hooks.js"
import { executeBeforeDeployHooks } from "./steps/execute-before-deploy-hooks.js"
import { initiateChangeSetCreate } from "./steps/initiate-change-set-create.js"
import { initiateFailedStackDelete } from "./steps/initiate-failed-stack-delete.js"
import { initiateStackCreateOrUpdate } from "./steps/initiate-stack-create-or-update.js"
import { initiateStackCreate } from "./steps/initiate-stack-create.js"
import { initiateStackUpdate } from "./steps/initiate-stack-update.js"
import { prepareParameters } from "./steps/prepare-parameters.js"
import { prepareTags } from "./steps/prepare-tags.js"
import { prepareTemplate } from "./steps/prepare-template.js"
import { reviewChangeSet } from "./steps/review-change-set.js"
import { summarizeTemplate } from "./steps/summarize-template.js"
import { updateTerminationProtection } from "./steps/update-termination-protection.js"
import { uploadTemplate } from "./steps/upload-template.js"
import { validateParameters } from "./steps/validate-parameters.js"
import { validateTemplate } from "./steps/validate-template.js"
import { waitChangeSetToBeReady } from "./steps/wait-change-set-to-be-ready.js"
import { waitDependenciesToComplete } from "./steps/wait-dependencies-to-complete.js"
import { waitFailedStackDeleteToComplete } from "./steps/wait-failed-stack-delete-to-complete.js"
import { waitStackCreateOrUpdateToComplete } from "./steps/wait-stack-create-or-update-to-complete.js"
import { waitStackRollbackToComplete } from "./steps/wait-stack-rollback-to-complete.js"
import { emitStackTemplate } from "./steps/emit-stack-template.js"

export interface DeployStackTransitions extends StackOperationTransitions {
  initiateFailedStackDelete: StackOperationStep<CurrentStackHolder>

  waitFailedStackDeleteToComplete: StackOperationStep<DeleteFailedStackClientTokenHolder>

  continueUpdateRollback: StackOperationStep<CurrentStackHolder>

  waitStackRollbackToComplete: StackOperationStep<ContinueStackRollbackClientTokenHolder>

  enrichCurrentStack: StackOperationStep<CurrentStackHolder>

  executeBeforeDeployHooks: StackOperationStep<DetailedCurrentStackHolder>

  prepareParameters: StackOperationStep<DetailedCurrentStackHolder>

  prepareTags: StackOperationStep<ParametersHolder>

  prepareTemplate: StackOperationStep<TagsHolder>

  uploadTemplate: StackOperationStep<TemplateBodyHolder>

  validateTemplate: StackOperationStep<TemplateLocationHolder>

  summarizeTemplate: StackOperationStep<TemplateLocationHolder>

  initiateChangeSetCreate: StackOperationStep<TemplateSummaryHolder>

  waitChangeSetToBeReady: StackOperationStep<ChangeSetNameHolder>

  reviewChangeSet: StackOperationStep<ChangeSetHolder>

  initiateStackCreateOrUpdate: StackOperationStep<TemplateSummaryHolder>

  validateParameters: StackOperationStep<TemplateSummaryHolder>

  initiateStackCreate: StackOperationStep<TemplateSummaryHolder>

  updateTerminationProtection: StackOperationStep<UpdateStackHolder>

  initiateStackUpdate: StackOperationStep<UpdateStackHolder>

  waitStackCreateOrUpdateToComplete: StackOperationStep<StackOperationClientTokenHolder>

  executeAfterDeployHooks: StackOperationStep<StackOperationResultHolder>

  emitStackTemplate: StackOperationStep<TemplateSummaryHolder>
}

export const createDeployStackTransitions = (): DeployStackTransitions => ({
  ...defaultStackOperationTransitions,

  start: inProgress(
    "wait-dependencies-to-complete",
    waitDependenciesToComplete,
  ),

  executeAfterDeployHooks: inProgress(
    "execute-after-deploy-hooks",
    executeAfterDeployHooks,
  ),

  executeBeforeDeployHooks: inProgress(
    "execute-before-deploy-hooks",
    executeBeforeDeployHooks,
  ),

  initiateChangeSetCreate: inProgress(
    "initiate-change-set-create",
    executeAfterDeployHooksOnError(initiateChangeSetCreate),
  ),

  initiateStackCreate: inProgress(
    "initiate-stack-create",
    executeAfterDeployHooksOnError(initiateStackCreate),
  ),

  initiateStackCreateOrUpdate: inProgress(
    "initiate-stack-create-or-update",
    executeAfterDeployHooksOnError(initiateStackCreateOrUpdate),
  ),

  validateParameters: inProgress(
    "validate-parameters",
    executeAfterDeployHooksOnError(validateParameters),
  ),

  initiateStackUpdate: inProgress(
    "initiate-stack-update",
    executeAfterDeployHooksOnError(initiateStackUpdate),
  ),

  prepareTemplate: inProgress(
    "prepare-template",
    executeAfterDeployHooksOnError(prepareTemplate),
  ),

  reviewChangeSet: inProgress(
    "review-change-set",
    executeAfterDeployHooksOnError(reviewChangeSet),
  ),

  summarizeTemplate: inProgress(
    "summarize-template",
    executeAfterDeployHooksOnError(summarizeTemplate),
  ),

  uploadTemplate: inProgress(
    "upload-template",
    executeAfterDeployHooksOnError(uploadTemplate),
  ),

  validateTemplate: inProgress(
    "validate-template",
    executeAfterDeployHooksOnError(validateTemplate),
  ),

  waitChangeSetToBeReady: inProgress(
    "wait-change-set-to-be-ready",
    executeAfterDeployHooksOnError(waitChangeSetToBeReady),
  ),

  waitStackCreateOrUpdateToComplete: inProgress(
    "wait-stack-create-or-update-complete",
    executeAfterDeployHooksOnError(waitStackCreateOrUpdateToComplete),
  ),

  prepareParameters: inProgress(
    "prepare-parameters",
    executeAfterDeployHooksOnError(prepareParameters),
  ),

  prepareTags: inProgress(
    "prepare-tags",
    executeAfterDeployHooksOnError(prepareTags),
  ),

  initiateFailedStackDelete: inProgress(
    "initiate-failed-stack-delete",
    initiateFailedStackDelete,
  ),

  continueUpdateRollback: inProgress(
    "continue-update-rollback",
    continueUpdateRollback,
  ),

  waitFailedStackDeleteToComplete: inProgress(
    "wait-failed-stack-delete-to-complete",
    waitFailedStackDeleteToComplete,
  ),

  waitStackRollbackToComplete: inProgress(
    "wait-stack-rollback-to-complete",
    waitStackRollbackToComplete,
  ),

  enrichCurrentStack: inProgress("enrich-current-stack", enrichCurrentStack),

  updateTerminationProtection: inProgress(
    "update-termination-protection",
    executeAfterDeployHooksOnError(updateTerminationProtection),
  ),

  emitStackTemplate: inProgress(
    "emit-stack-template",
    executeAfterDeployHooksOnError(emitStackTemplate),
  ),
})

export const executeAfterDeployHooksOnError =
  <S extends InitialDeployStackState>(
    step: StackOperationStep<S>,
  ): StackOperationStep<S> =>
  async (state: S) => {
    try {
      return await step(state)
      // eslint-disable-next-line
    } catch (error: any) {
      state.logger.error("An error occurred", error)
      return state.transitions.executeAfterDeployHooks({
        events: [],
        ...state,
        error,
        success: false,
        status: "FAILED",
        message: resolveResultMessage(state.operationType, false),
      })
    }
  }
