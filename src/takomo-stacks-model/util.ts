import { CommandPath } from "../command/command-model.js"
import { InternalStack, Stack, StackPath } from "../stacks/stack.js"

export const getStackPath = ({ path }: Stack): StackPath => path

export const isObsolete = (stack: InternalStack): boolean => stack.obsolete

export const isNotObsolete = (stack: InternalStack): boolean =>
  !isObsolete(stack)

export const isWithinCommandPath = (
  commandPath: CommandPath,
  other: CommandPath,
): boolean => commandPath.startsWith(other.slice(0, commandPath.length))
