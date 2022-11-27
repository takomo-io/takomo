import { AnySchema } from "joi"
import {
  DetailedChangeSet,
  DetailedCloudFormationStack,
  StackParameterKey,
  StackParameterValue,
  TagKey,
  TagValue,
  TemplateBody,
  TemplateSummary,
} from "../../../takomo-aws-model"
import { StackEvent } from "../../../takomo-aws-model/cloudformation"
import { IO } from "../../../takomo-core/command"

import { InternalStack, StackPath } from "../../../stacks/stack"
import { StackGroup } from "../../../stacks/stack-group"
import { CommandPath, StackOperationType } from "../../command-model"
import { StacksOperationListener } from "../common/model"
import { StacksOperationOutput } from "../model"
import { StacksDeployPlan } from "./plan"

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
    operationType: StackOperationType,
    existingStack?: DetailedCloudFormationStack,
    changeSet?: DetailedChangeSet,
  ) => Promise<ConfirmStackDeployAnswer>
  readonly confirmDeploy: (
    plan: StacksDeployPlan,
  ) => Promise<ConfirmDeployAnswer>
  readonly printStackEvent: (stackPath: StackPath, e: StackEvent) => void
  readonly createStacksOperationListener: (
    stackCount: number,
  ) => StacksOperationListener
}

export interface DeployState {
  cancelled: boolean
  autoConfirm: boolean
}

export interface StackParameterInfo {
  readonly key: StackParameterKey
  readonly value: StackParameterValue
  readonly immutable: boolean
  readonly schema?: AnySchema
}

export interface StackTagInfo {
  readonly key: TagKey
  readonly value: TagValue
}
