import { StackName } from "@takomo/aws-model"
import R from "ramda"
import { InternalStack, Stack, StackPath } from "./stack"

/**
 * @hidden
 */
export const getStackPath = ({ path }: Stack): StackPath => path

/**
 * @hidden
 */
export const getStackName = ({ name }: Stack): StackName => name

/**
 * @hidden
 */
export const getStackPaths: (
  stacks: ReadonlyArray<Stack>,
) => ReadonlyArray<StackPath> = R.map(getStackPath)

/**
 * @hidden
 */
export const getStackNames: (
  stacks: ReadonlyArray<Stack>,
) => ReadonlyArray<StackName> = R.map(getStackName)

/**
 * @hidden
 */
export const isObsolete = (stack: InternalStack): boolean => stack.obsolete

/**
 * @hidden
 */
export const isNotObsolete = (stack: InternalStack): boolean =>
  !isObsolete(stack)
