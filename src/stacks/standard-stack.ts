import { CloudFormation } from "@aws-sdk/client-cloudformation"
import {
  CloudFormationStack,
  StackCapability,
  StackPolicyBody,
} from "../aws/cloudformation/model.js"
import { CloudFormationClient } from "../aws/cloudformation/client.js"
import { TemplateBucketConfig } from "../common/model.js"
import { FilePath } from "../utils/files.js"
import {
  BaseInternalStack,
  Stack as InternalStack,
  Stack,
  StackProps,
} from "./stack.js"
import { InternalCredentialManager } from "../aws/common/credentials.js"

/**
 * Blueprint path.
 */
export type BlueprintPath = string

export interface Template {
  readonly dynamic: boolean
  readonly filename?: FilePath
  readonly inline?: string
}

export interface StandardStackProps extends StackProps {
  template: Template
  templateBucket?: TemplateBucketConfig
  capabilities?: ReadonlyArray<StackCapability>
  getCloudFormationClient: () => Promise<CloudFormationClient>
  stackPolicy?: StackPolicyBody
  stackPolicyDuringUpdate?: StackPolicyBody
}

/**
 * An interface representing a standard CloudFormation stack configuration.
 */
export interface StandardStack extends InternalStack {
  /**
   * Get CloudFormation client
   */
  readonly getClient: () => Promise<CloudFormation>

  /**
   * Get current CloudFormation stack
   */
  readonly getCurrentCloudFormationStack: () => Promise<
    CloudFormationStack | undefined
  >
}

export interface InternalStandardStack
  extends StandardStack,
    BaseInternalStack {
  readonly template: Template
  readonly templateBucket?: TemplateBucketConfig
  readonly capabilities?: ReadonlyArray<StackCapability>
  readonly stackPolicy?: StackPolicyBody
  readonly stackPolicyDuringUpdate?: StackPolicyBody
  readonly getCloudFormationClient: () => Promise<CloudFormationClient>
  readonly credentialManager: InternalCredentialManager
  readonly toProps: () => StandardStackProps
}

export const createStandardStack = (
  props: StandardStackProps,
): InternalStandardStack => {
  const {
    accountIds,
    capabilities,
    commandRole,
    credentialManager,
    data,
    dependents,
    dependencies,
    hooks,
    ignore,
    obsolete,
    logger,
    name,
    parameters,
    path,
    project,
    region,
    stackGroupPath,
    tags,
    template,
    templateBucket,
    terminationProtection,
    timeout,
    getCloudFormationClient,
    stackPolicy,
    stackPolicyDuringUpdate,
    schemas,
  } = props

  const getClient = async () =>
    getCloudFormationClient().then((c) => c.getNativeClient())

  const getCurrentCloudFormationStack = () =>
    getCloudFormationClient().then((c) => c.describeStack(name))

  const getCredentials = () => credentialManager.getCredentials()

  return {
    accountIds,
    capabilities,
    commandRole,
    getCredentials,
    credentialManager,
    data,
    dependents,
    dependencies,
    getClient,
    getCloudFormationClient,
    getCurrentCloudFormationStack,
    hooks,
    ignore,
    obsolete,
    logger,
    name,
    parameters,
    path,
    project,
    region,
    stackGroupPath,
    tags,
    template,
    templateBucket,
    terminationProtection,
    timeout,
    stackPolicy,
    stackPolicyDuringUpdate,
    schemas,
    toProps: () => props,
  }
}

export const isStandardStackProps = (
  props: StackProps,
): props is StandardStackProps => !("type" in props)

export const isInternalStandardStack = (
  stack: InternalStack,
): stack is InternalStandardStack => !("type" in stack)

export const isStandardStack = (stack: Stack): stack is StandardStack =>
  !("type" in stack)
