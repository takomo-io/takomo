import { Project, StackName, StackPath } from "@takomo/core"

export const makeStackName = (
  stackPath: StackPath,
  project: Project | null,
): StackName => {
  const prefix = project ? `${project}-` : ""
  const cleanedStackPath = stackPath.substr(1)
  return `${prefix}${cleanedStackPath}`
    .replace(/\//g, "-")
    .replace(/\.yml$/, "")
}
