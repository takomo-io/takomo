import { StackName } from "../../aws/cloudformation/model.js"
import { StackPath } from "../../stacks/stack.js"
import { Project } from "../../takomo-core/command.js"

export const makeStackName = (
  stackPath: StackPath,
  project?: Project,
): StackName => {
  const prefix = project ? `${project}-` : ""
  const cleanedStackPath = stackPath.slice(1)
  return `${prefix}${cleanedStackPath}`
    .replace(/\//g, "-")
    .replace(/\.yml$/, "")
}
