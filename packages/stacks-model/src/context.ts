import { CredentialManager } from "@takomo/aws-clients"
import { CommandContext } from "@takomo/core"
import { TemplateEngine } from "@takomo/util"
import { InternalStack, Stack, StackPath } from "./stack"
import { StackGroup, StackGroupPath } from "./stack-group"

/**
 * Immutable object that provides access to the current stack context.
 */
export interface StacksContext extends CommandContext {
  readonly credentialManager: CredentialManager
  readonly templateEngine: TemplateEngine
  readonly getStackByExactPath: (path: StackPath) => Stack
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
