import { CredentialManager } from "@takomo/aws-clients"
import { CommandContext } from "@takomo/core"
import { TemplateEngine } from "@takomo/util"
import { InternalStack, Stack, StackPath } from "./stack"
import { StackGroup, StackGroupPath } from "./stack-group"

/**
 * Provides access to the current stack context and
 * project configuration.
 */
export interface StacksContext extends CommandContext {
  /**
   * Credential manager that provides access to AWS credentials used
   * to invoke the current operation.
   */
  readonly credentialManager: CredentialManager

  /**
   * Template engine instance.
   */
  readonly templateEngine: TemplateEngine

  /**
   * Return a stack by exact path or throw an error if no stack is found
   */
  readonly getStackByExactPath: (path: StackPath) => Stack

  /**
   * Return 0 or more stacks by path.
   */
  readonly getStacksByPath: (path: StackPath) => ReadonlyArray<Stack>
}

/**
 * @hidden
 */
export interface InternalStacksContext extends CommandContext {
  readonly credentialManager: CredentialManager
  readonly templateEngine: TemplateEngine
  readonly rootStackGroup: StackGroup
  readonly stacks: ReadonlyArray<InternalStack>
  readonly getStackGroup: (
    stackGroupPath: StackGroupPath,
  ) => StackGroup | undefined
  readonly getStackByExactPath: (path: StackPath) => InternalStack
  readonly getStacksByPath: (path: StackPath) => ReadonlyArray<InternalStack>
}
