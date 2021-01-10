import {
  deployStacksCommandIamPolicy,
  undeployStacksCommandIamPolicy,
} from "@takomo/stacks-commands"

/**
 * @hidden
 */
export const deployTargetsOperationCommandIamPolicy = (): string =>
  deployStacksCommandIamPolicy()

/**
 * @hidden
 */
export const undeployTargetsOperationCommandIamPolicy = (): string =>
  undeployStacksCommandIamPolicy()
