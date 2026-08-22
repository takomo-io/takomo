import { CommandPath } from "../command/command-model.js"
import { InternalStack, Stack, StackPath } from "../stacks/stack.js"

export const getStackPath = ({ path }: Stack): StackPath => path

export const isObsolete = (stack: InternalStack): boolean => stack.obsolete

export const isNotObsolete = (stack: InternalStack): boolean =>
  !isObsolete(stack)

export const isWithinCommandPath = (
  commandPath: CommandPath,
  path: CommandPath,
): boolean => {
  const pathSegments = path.split("/").filter(Boolean)
  const commandPathSegments = commandPath.split("/").filter(Boolean)

  return (
    commandPathSegments.length <= pathSegments.length &&
    commandPathSegments.every(
      (segment, index) => segment === pathSegments[index],
    )
  )
}

export const isRelatedToCommandPath = (
  commandPath: CommandPath,
  path: CommandPath,
): boolean =>
  isWithinCommandPath(commandPath, path) ||
  isWithinCommandPath(path, commandPath)
