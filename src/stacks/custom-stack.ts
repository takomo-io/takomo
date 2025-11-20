import { InternalCredentialManager } from "../aws/common/credentials.js"
import {
  BaseInternalStack,
  CustomStackType,
  InternalStack,
  Stack,
  StackProps,
} from "./stack.js"

export type CustomStackStatus = "PENDING" | "CREATE_COMPLETED"

export interface CustomStackProps extends StackProps {
  customType: CustomStackType
  customConfig?: unknown
}

/**
 * An interface representing a custom stack configuration.
 */
export interface CustomStack extends Stack {
  readonly customType: CustomStackType
}

export interface InternalCustomStack extends CustomStack, BaseInternalStack {
  readonly credentialManager: InternalCredentialManager
  readonly customType: CustomStackType
  readonly customConfig?: unknown
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
    customType,
    customConfig,
  } = props

  return {
    customType,
    customConfig,
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
    getCredentials: () => credentialManager.getCredentials(),
    toProps: () => props,
  }
}

const hasCustomType = (obj: unknown): boolean =>
  obj !== undefined &&
  obj !== null &&
  typeof obj === "object" &&
  "customType" in obj &&
  obj.customType !== undefined

export const isCustomStackProps = (
  props: StackProps,
): props is CustomStackProps => hasCustomType(props)

export const isInternalCustomStack = (
  stack: InternalStack,
): stack is InternalCustomStack => hasCustomType(stack)

export const isCustomStack = (stack: Stack): stack is CustomStack =>
  hasCustomType(stack)
