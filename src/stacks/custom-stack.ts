import { InternalCredentialManager } from "../aws/common/credentials.js"
import {
  BaseInternalStack,
  Stack as InternalStack,
  Stack,
  StackProps,
} from "./stack.js"

export type CustomStackType = string

export interface CustomStackProps extends StackProps {
  type: CustomStackType
  config: Record<string, unknown>
}

/**
 * An interface representing a custom stack configuration.
 */
export interface CustomStack extends InternalStack {
  readonly type: CustomStackType
}

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
): props is CustomStackProps => "type" in props

export const isInternalCustomStack = (
  stack: InternalStack,
): stack is InternalCustomStack => "type" in stack

export const isCustomStack = (stack: Stack): stack is CustomStack =>
  "type" in stack
