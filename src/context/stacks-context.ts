import { CredentialManager } from "../aws/common/credentials.js"
import { StackGroup, StackGroupPath } from "../stacks/stack-group.js"
import { TemplateEngine } from "../templating/template-engine.js"
import { CommandContext, InternalCommandContext } from "./command-context.js"
import { Cache } from "../caches/cache.js"
import { InternalStack, Stack, StackPath } from "../stacks/stack.js"
import { CustomStackHandlerRegistry } from "../custom-stacks/custom-stack-handler-registry.js"

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
   * Shared cache for values that needs to be persisted for the duration of the current operation.
   */
  readonly cache: Cache

  /**
   * Return a stack by exact path or throw an error if no stack is found.
   * The stack path can be relative if stackGroupPath is given.
   */
  readonly getStackByExactPath: (
    path: StackPath,
    stackGroupPath?: StackGroupPath,
  ) => Stack

  /**
   * Return 0 or more stacks by path. The stack path can be relative if
   * stackGroupPath is given.
   */
  readonly getStacksByPath: (
    path: StackPath,
    stackGroupPath?: StackGroupPath,
  ) => ReadonlyArray<Stack>
}

export interface InternalStacksContext extends InternalCommandContext {
  readonly cache: Cache
  readonly concurrentStacks: number
  readonly credentialManager: CredentialManager
  readonly templateEngine: TemplateEngine
  readonly customStackHandlerRegistry: CustomStackHandlerRegistry
  readonly rootStackGroup: StackGroup
  readonly stacks: ReadonlyArray<InternalStack>
  readonly getStackGroup: (
    stackGroupPath: StackGroupPath,
  ) => StackGroup | undefined
  readonly getStackByExactPath: (
    path: StackPath,
    stackGroupPath?: StackGroupPath,
  ) => InternalStack
  readonly getStacksByPath: (
    path: StackPath,
    stackGroupPath?: StackGroupPath,
  ) => ReadonlyArray<InternalStack>
}
