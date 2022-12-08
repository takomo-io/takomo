import { StackName } from "../../aws/cloudformation/model"
import { StackPath } from "../../stacks/stack"
import { Project } from "../../takomo-core/command"

export const makeStackName = (
  stackPath: StackPath,
  project?: Project,
): StackName => {
  const prefix = project ? `${project}-` : ""
  const cleanedStackPath = stackPath.substr(1)
  return `${prefix}${cleanedStackPath}`
    .replace(/\//g, "-")
    .replace(/\.yml$/, "")
}
