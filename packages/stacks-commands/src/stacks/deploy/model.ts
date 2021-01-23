import {
  DetailedChangeSet,
  DetailedCloudFormationStack,
  StackEvent,
  StackParameterKey,
  StackParameterValue,
  TagKey,
  TagValue,
  TemplateBody,
  TemplateSummary,
} from "@takomo/aws-model"
import { IO } from "@takomo/core"
import {
  CommandPath,
  InternalStack,
  StackGroup,
  StackPath,
} from "@takomo/stacks-model"
import { StacksOperationOutput } from "../../model"
import { StackDeployOperationType, StacksDeployPlan } from "./plan"

export type ConfirmDeployAnswer =
  | "CANCEL"
  | "CONTINUE_AND_REVIEW"
  | "CONTINUE_NO_REVIEW"

export type ConfirmStackDeployAnswer =
  | "CANCEL"
  | "REVIEW_TEMPLATE"
  | "CONTINUE"
  | "CONTINUE_AND_SKIP_REMAINING_REVIEWS"

export interface DeployStacksIO extends IO<StacksOperationOutput> {
  readonly chooseCommandPath: (
    rootStackGroup: StackGroup,
  ) => Promise<CommandPath>
  readonly confirmStackDeploy: (
    stack: InternalStack,
    templateBody: TemplateBody,
    templateSummary: TemplateSummary,
    operationType: StackDeployOperationType,
    existingStack?: DetailedCloudFormationStack,
    changeSet?: DetailedChangeSet,
  ) => Promise<ConfirmStackDeployAnswer>
  readonly confirmDeploy: (
    plan: StacksDeployPlan,
  ) => Promise<ConfirmDeployAnswer>
  readonly printStackEvent: (stackPath: StackPath, e: StackEvent) => void
}

/**
 * @hidden
 */
export interface DeployState {
  cancelled: boolean
  autoConfirm: boolean
}

/**
 * @hidden
 */
export interface StackParameterInfo {
  readonly key: StackParameterKey
  readonly value: StackParameterValue
  readonly immutable: boolean
}

/**
 * @hidden
 */
export interface StackTagInfo {
  readonly key: TagKey
  readonly value: TagValue
}
