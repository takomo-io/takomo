import { InternalCredentialManager } from "../aws/common/credentials.js"
import { CustomStackHandler } from "../custom-stacks/custom-stack-handler.js"
import {
  BaseInternalStack,
  CustomStackType,
  InternalStack,
  Stack,
  StackProps,
} from "./stack.js"

export type CustomStackStatus =
  | "PENDING"
  | "CREATE_COMPLETE"
  | "UPDATE_COMPLETE"

export interface CustomStackProps extends StackProps {
  customType: CustomStackType
  customConfig: unknown
  customStackHandler: CustomStackHandler<any, any>
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
  readonly customConfig: unknown
  readonly customStackHandler: CustomStackHandler<any, any>
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
    customStackHandler,
  } = props

  return {
    customType,
    customConfig,
    customStackHandler,
    accountIds,
    commandRole,
    credentialManager,
    data,
    dependents,
    dependencies,
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
