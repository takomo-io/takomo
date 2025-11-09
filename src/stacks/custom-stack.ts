import { InternalCredentialManager } from "../aws/common/credentials.js"
import { InternalStack, Stack, StackProps } from "./stack.js"

export type CustomStackType = string

export interface CustomStackProps extends StackProps {
  type: CustomStackType
}

/**
 * An interface representing a custom stack configuration.
 */
export interface CustomStack extends Stack {
  readonly type: CustomStackType
}

export interface InternalCustomStack extends CustomStack, InternalStack {
  readonly credentialManager: InternalCredentialManager
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
  } = props

  const getCredentials = () => credentialManager.getCredentials()

  return {
    type,
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

export const isCustomStack = (stack: Stack): stack is InternalCustomStack =>
  "type" in stack
