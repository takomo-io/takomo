import * as CF from "@aws-sdk/client-cloudformation"
import { ClientRequestToken, TagKey, TagValue } from "../common/model.js"
import {
  CausingEntity,
  ChangeSet,
  ChangeSetId,
  ChangeSetName,
  ChangeSetStatus,
  ChangeSetStatusReason,
  ChangeSource,
  ChangeType,
  CloudFormationStack,
  DetailedCloudFormationStackSummary,
  EnableTerminationProtection,
  EvaluationType,
  EventId,
  LogicalResourceId,
  PhysicalResourceId,
  PropertyName,
  RequiresRecreation,
  ResourceAttribute,
  ResourceChangeAction,
  ResourceChangeReplacement,
  ResourceProperties,
  ResourceStatus,
  ResourceStatusReason,
  ResourceTargetDefinition,
  ResourceType,
  StackCapability,
  StackDriftDetectionId,
  StackDriftDetectionStatus,
  StackDriftDetectionStatusOutput,
  StackDriftDetectionStatusReason,
  StackDriftStatus,
  StackEvent,
  StackId,
  StackName,
  StackOutputDescription,
  StackOutputKey,
  StackOutputValue,
  StackParameterDescription,
  StackParameterKey,
  StackParameterNoEcho,
  StackParameterValue,
  StackStatus,
  StackStatusReason,
  TemplateDescription,
  TemplateSummary,
} from "./model.js"

const convertStackInternal = (s: CF.Stack): CloudFormationStack => ({
  id: s.StackId as StackId,
  name: s.StackName as StackName,
  parameters: (s.Parameters ?? []).map((p) => ({
    value: p.ParameterValue as StackParameterValue,
    key: p.ParameterKey as StackParameterKey,
  })),
  status: s.StackStatus as StackStatus,
  statusReason: s.StackStatusReason as StackStatusReason,
  enableTerminationProtection:
    s.EnableTerminationProtection as EnableTerminationProtection,
  capabilities: s.Capabilities as StackCapability[],
  creationTime: s.CreationTime as Date,
  lastUpdatedTime: s.LastUpdatedTime,
  outputs: (s.Outputs ?? []).map((o) => ({
    key: o.OutputKey as StackOutputKey,
    value: o.OutputValue as StackOutputValue,
    description: o.Description as StackOutputDescription,
  })),
  tags: (s.Tags ?? []).map((t) => ({
    key: t.Key as TagKey,
    value: t.Value as TagValue,
  })),
  driftInformation: {
    stackDriftStatus: s.DriftInformation!.StackDriftStatus as StackDriftStatus,
    lastCheckTimestamp: s.DriftInformation?.LastCheckTimestamp,
  },
  deletionTime: s.DeletionTime,
})

export const convertStack = ({
  Stacks,
}: CF.DescribeStacksOutput): CloudFormationStack => {
  if (!Stacks) {
    throw new Error("Expected Stacks to be defined")
  }

  const [s] = Stacks
  if (!s) {
    throw new Error("Expected Stacks not to be empty")
  }

  return convertStackInternal(s)
}

const convertResourceChangeTarget = (
  target?: CF.ResourceTargetDefinition,
): ResourceTargetDefinition | undefined => {
  if (!target) {
    return undefined
  }

  return {
    attribute: target.Attribute as ResourceAttribute,
    name: target.Name as PropertyName,
    requiresRecreation: target.RequiresRecreation as RequiresRecreation,
  }
}

export const convertChangeSet = (o: CF.DescribeChangeSetOutput): ChangeSet => ({
  id: o.ChangeSetId as ChangeSetId,
  name: o.ChangeSetName as ChangeSetName,
  stackId: o.StackId as StackId,
  status: o.Status as ChangeSetStatus,
  statusReason: o.StatusReason as ChangeSetStatusReason,
  parameters: (o.Parameters ?? []).map((p) => ({
    key: p.ParameterKey as StackParameterKey,
    value: p.ParameterValue as StackParameterValue,
  })),
  tags: (o.Tags ?? []).map((t) => ({
    key: t.Key as TagKey,
    value: t.Value as TagValue,
  })),
  changes: (o.Changes ?? []).map((c) => ({
    type: c.Type as ChangeType,
    resourceChange: {
      action: c.ResourceChange?.Action as ResourceChangeAction,
      logicalResourceId: c.ResourceChange
        ?.LogicalResourceId as LogicalResourceId,
      physicalResourceId: c.ResourceChange
        ?.PhysicalResourceId as PhysicalResourceId,
      resourceType: c.ResourceChange?.ResourceType as ResourceType,
      replacement: c.ResourceChange?.Replacement as ResourceChangeReplacement,
      scope: c.ResourceChange?.Scope?.map((a) => a as ResourceAttribute) ?? [],
      details:
        c.ResourceChange?.Details?.map((d) => ({
          target: convertResourceChangeTarget(d.Target),
          evaluation: d.Evaluation as EvaluationType,
          causingEntity: d.CausingEntity as CausingEntity,
          changeSource: d.ChangeSource as ChangeSource,
        })) ?? [],
    },
  })),
})

export const convertTemplateSummary = ({
  Parameters,
}: CF.GetTemplateSummaryOutput): TemplateSummary => ({
  parameters: (Parameters ?? []).map((p) => ({
    key: p.ParameterKey as StackParameterKey,
    noEcho: p.NoEcho as StackParameterNoEcho,
    description: p.Description as StackParameterDescription,
    defaultValue: p.DefaultValue as StackParameterValue,
  })),
})

export const convertStackEvents = ({
  StackEvents,
}: CF.DescribeStackEventsOutput): StackEvent[] =>
  (StackEvents ?? []).map((e) => ({
    id: e.EventId as EventId,
    clientRequestToken: e.ClientRequestToken as ClientRequestToken,
    logicalResourceId: e.LogicalResourceId as LogicalResourceId,
    physicalResourceId: e.PhysicalResourceId as PhysicalResourceId,
    resourceProperties: e.ResourceProperties as ResourceProperties,
    resourceStatus: e.ResourceStatus as ResourceStatus,
    resourceStatusReason: e.ResourceStatusReason as ResourceStatusReason,
    resourceType: e.ResourceType as ResourceType,
    stackId: e.StackId as StackId,
    stackName: e.StackName as StackName,
    timestamp: e.Timestamp as Date,
  }))

export const convertStackDriftDetectionStatus = (
  d: CF.DescribeStackDriftDetectionStatusOutput,
): StackDriftDetectionStatusOutput => ({
  detectionStatus: d.DetectionStatus as StackDriftDetectionStatus,
  detectionStatusReason:
    d.DetectionStatusReason as StackDriftDetectionStatusReason,
  stackDriftDetectionId: d.StackDriftDetectionId as StackDriftDetectionId,
  stackDriftStatus: d.StackDriftStatus as StackDriftStatus,
  stackId: d.StackId as StackId,
  driftedStackResourceCount: d.DriftedStackResourceCount!,
  timestamp: d.Timestamp!,
})

export const convertStackSummaries = ({
  StackSummaries,
}: CF.ListStacksOutput): ReadonlyArray<DetailedCloudFormationStackSummary> =>
  (StackSummaries ?? []).map((s) => ({
    id: s.StackId as StackId,
    name: s.StackName as StackName,
    status: s.StackStatus as StackStatus,
    statusReason: s.StackStatusReason as StackStatusReason,
    creationTime: s.CreationTime as Date,
    lastUpdatedTime: s.LastUpdatedTime,
    deletionTime: s.DeletionTime,
    driftInformation: {
      stackDriftStatus: s.DriftInformation!
        .StackDriftStatus as StackDriftStatus,
      lastCheckTimestamp: s.DriftInformation?.LastCheckTimestamp,
    },
    templateDescription: s.TemplateDescription as TemplateDescription,
  }))
