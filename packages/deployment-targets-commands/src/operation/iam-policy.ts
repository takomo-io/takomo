import {
  deployStacksCommandIamPolicy,
  undeployStacksCommandIamPolicy,
} from "@takomo/stacks-commands"

export const deployTargetsOperationCommandIamPolicy = (): string =>
  deployStacksCommandIamPolicy()

export const undeployTargetsOperationCommandIamPolicy = (): string =>
  undeployStacksCommandIamPolicy()
