import { StackName } from "@takomo/aws-model"
import R from "ramda"
import { Stack, StackPath } from "./stack"

/**
 * @hidden
 */
export const getStackPaths: (
  stacks: ReadonlyArray<Stack>,
) => ReadonlyArray<StackPath> = R.map(R.prop("path"))

/**
 * @hidden
 */
export const getStackNames: (
  stacks: ReadonlyArray<Stack>,
) => ReadonlyArray<StackName> = R.map(R.prop("name"))
