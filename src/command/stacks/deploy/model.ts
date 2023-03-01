import { AnySchema } from "joi"
import {
  DetailedChangeSet,
  DetailedCloudFormationStack,
  StackEvent,
  StackParameterKey,
  StackParameterValue,
  TemplateBody,
  TemplateSummary,
} from "../../../aws/cloudformation/model.js"
import { IO } from "../../../takomo-core/command.js"

import { TagKey, TagValue } from "../../../aws/common/model.js"
import { StackGroup } from "../../../stacks/stack-group.js"
import { InternalStack, StackPath } from "../../../stacks/stack.js"
import { CommandPath, StackOperationType } from "../../command-model.js"
import { StacksOperationListener } from "../common/model.js"
import { StacksOperationOutput } from "../model.js"
import { StacksDeployPlan } from "./plan.js"

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
