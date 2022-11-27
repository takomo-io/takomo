import R from "ramda"
import { CommandPath } from "../command/command-model"
import { InternalStack, Stack, StackPath } from "../stacks/stack"
import { StackName } from "../takomo-aws-model"

export const getStackPath = ({ path }: Stack): StackPath => path

export const getStackName = ({ name }: Stack): StackName => name

export const getStackPaths: (
  stacks: ReadonlyArray<Stack>,
) => ReadonlyArray<StackPath> = R.map(getStackPath)

export const getStackNames: (
  stacks: ReadonlyArray<Stack>,
) => ReadonlyArray<StackName> = R.map(getStackName)

export const isObsolete = (stack: InternalStack): boolean => stack.obsolete

export const isNotObsolete = (stack: InternalStack): boolean =>
  !isObsolete(stack)

export const isWithinCommandPath = (
  commandPath: CommandPath,
  other: CommandPath,
): boolean => commandPath.startsWith(other.substr(0, commandPath.length))
