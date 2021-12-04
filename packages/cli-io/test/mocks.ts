import {
  CloudFormationStack,
  DetailedCloudFormationStack,
  Region,
  StackName,
} from "@takomo/aws-model"
import { InternalStack, StackPath } from "@takomo/stacks-model"
import { mockDeep } from "jest-mock-extended"

export interface MockDetailedCloudFormationStackProps {
  readonly enableTerminationProtection?: boolean
}

export const mockDetailedCloudFormationStack = ({
  enableTerminationProtection = false,
}: MockDetailedCloudFormationStackProps): DetailedCloudFormationStack =>
  mockDeep<DetailedCloudFormationStack>({
    enableTerminationProtection,
  })

export interface MockInternalStackProps {
  readonly name: StackName
  readonly path: StackPath
  readonly region: Region
  readonly currentStack?: CloudFormationStack
  readonly terminationProtection?: boolean
  readonly dependents?: ReadonlyArray<StackPath>
  readonly dependencies?: ReadonlyArray<StackPath>
}

export const mockInternalStack = ({
  name,
  path,
  region,
  terminationProtection = false,
  dependents = [],
  dependencies = [],
}: MockInternalStackProps): InternalStack => {
  const stack = mockDeep<InternalStack>({
    name,
    path,
    region,
    terminationProtection,
    dependents,
    dependencies,
  })

  stack.credentialManager.getCallerIdentity.calledWith().mockResolvedValue({
    arn: "arn:aws:iam::123456789012:user/reiner-braun",
    userId: "AIDARKRBVDY5HHA3SQU7Q",
    accountId: "123456789012",
  })

  return stack
}
