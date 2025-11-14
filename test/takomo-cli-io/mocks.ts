import { mockDeep } from "jest-mock-extended"
import {
  CloudFormationStack,
  DetailedCloudFormationStack,
  StackName,
} from "../../src/aws/cloudformation/model.js"
import { Region } from "../../src/aws/common/model.js"
import { StackPath } from "../../src/stacks/stack.js"
import {
  InternalStandardStack,
  STANDARD_STACK_TYPE,
} from "../../src/stacks/standard-stack.js"

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
}: MockInternalStackProps): InternalStandardStack => {
  const stack = mockDeep<InternalStandardStack>({
    name,
    path,
    region,
    terminationProtection,
    dependents,
    dependencies,
    type: STANDARD_STACK_TYPE,
  })

  stack.credentialManager.getCallerIdentity.calledWith().mockResolvedValue({
    arn: "arn:aws:iam::123456789012:user/reiner-braun",
    userId: "AIDARKRBVDY5HHA3SQU7Q",
    accountId: "123456789012",
  })

  return stack
}
