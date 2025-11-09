import * as R from "ramda"
import { StackName } from "../aws/cloudformation/model.js"
import { CommandPath } from "../command/command-model.js"
import { StandardStack } from "../stacks/standard-stack.js"
import { InternalStack, StackPath } from "../stacks/stack.js"

export const getStackPath = ({ path }: StandardStack): StackPath => path

export const getStackName = ({ name }: StandardStack): StackName => name

export const getStackPaths: (
  stacks: ReadonlyArray<StandardStack>,
) => ReadonlyArray<StackPath> = R.map(getStackPath)

export const getStackNames: (
  stacks: ReadonlyArray<StandardStack>,
) => ReadonlyArray<StackName> = R.map(getStackName)

export const isObsolete = (stack: InternalStack): boolean => stack.obsolete

export const isNotObsolete = (stack: InternalStack): boolean =>
  !isObsolete(stack)

export const isWithinCommandPath = (
  commandPath: CommandPath,
  other: CommandPath,
): boolean => commandPath.startsWith(other.slice(0, commandPath.length))
