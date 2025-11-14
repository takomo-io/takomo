import { InternalCredentialManager } from "../aws/common/credentials.js"
import {
  BaseInternalStack,
  CustomStackType,
  InternalStack,
  Stack,
  StackProps,
} from "./stack.js"
import {
  isInternalStandardStack,
  isStandardStack,
  isStandardStackProps,
} from "./standard-stack.js"

export type CustomStackStatus = "PENDING" | "CREATE_COMPLETED"

export type CustomStackState = {
  value: unknown
  status?: CustomStackStatus
  lastUpdatedTime?: Date
  creationTime?: Date
  parameters?: Record<string, string>
  tags?: Record<string, string>
  outputs?: Record<string, string>
}

export interface CustomStackProps extends StackProps {
  type: CustomStackType
  config: Record<string, unknown>
}

/**
 * An interface representing a custom stack configuration.
 */
export interface CustomStack extends Stack {}

export interface InternalCustomStack extends CustomStack, BaseInternalStack {
  readonly credentialManager: InternalCredentialManager
  readonly config: Record<string, unknown>
  readonly toProps: () => CustomStackProps
}

export const createCustomStack = (
  props: CustomStackProps,
): InternalCustomStack => {
  const {
    accountIds,
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
    terminationProtection,
    timeout,
    schemas,
    type,
    config,
  } = props

  const getCredentials = () => credentialManager.getCredentials()

  return {
    type,
    config,
    accountIds,
    commandRole,
    getCredentials,
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
    terminationProtection,
    timeout,
    schemas,
    toProps: () => props,
  }
}

export const isCustomStackProps = (
  props: StackProps,
): props is CustomStackProps => !isStandardStackProps(props)

export const isInternalCustomStack = (
  stack: InternalStack,
): stack is InternalCustomStack => !isInternalStandardStack(stack)

export const isCustomStack = (stack: Stack): stack is CustomStack =>
  !isStandardStack(stack)
