import R from "ramda"
import { Stack, StackPath } from "./stack"

/**
 * @hidden
 */
export const getStackPaths: (
  stacks: ReadonlyArray<Stack>,
) => ReadonlyArray<StackPath> = R.map(R.prop("path"))
