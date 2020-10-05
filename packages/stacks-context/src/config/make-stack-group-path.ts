import { StackGroupPath } from "@takomo/core"
import { StackGroup } from "@takomo/stacks-model"
import { FilePath } from "@takomo/util"
import path from "path"

export const makeStackGroupPath = (
  dirPath: FilePath,
  parent: StackGroup,
): StackGroupPath => {
  const dirName = path.basename(dirPath)
  return parent.isRoot() ? `/${dirName}` : `${parent.getPath()}/${dirName}`
}
