import * as CF from "@aws-sdk/client-cloudformation"
import { ClientRequestToken, TagKey, TagValue } from "../common/model.js"
import {
  ChangeSet,
  ChangeSetId,
  ChangeSetName,
  ChangeSetStatusReason,
  CloudFormationStack,
  DetailedCloudFormationStackSummary,
  EnableTerminationProtection,
  EventId,
  LogicalResourceId,
  PhysicalResourceId,
  ResourceProperties,
  ResourceStatus,
  ResourceStatusReason,
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

export const convertChangeSet = (o: CF.DescribeChangeSetOutput): ChangeSet => ({
  id: o.ChangeSetId as ChangeSetId,
  name: o.ChangeSetName as ChangeSetName,
  stackId: o.StackId as StackId,
  status: o.Status!,
  statusReason: o.StatusReason as ChangeSetStatusReason,
  parameters: (o.Parameters ?? []).map((p) => ({
    key: p.ParameterKey as StackParameterKey,
    value: p.ParameterValue as StackParameterValue,
  })),
  tags: (o.Tags ?? []).map((t) => ({
    key: t.Key as TagKey,
    value: t.Value as TagValue,
  })),
  changes: o.Changes ?? [],
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
