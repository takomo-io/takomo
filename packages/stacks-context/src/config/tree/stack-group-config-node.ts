import { StackGroupPath } from "@takomo/core"
import { Dir, File } from "@takomo/util"
import { StackConfigNode } from "./stack-config-node"

export interface StackGroupConfigNode {
  readonly path: StackGroupPath
  readonly parentPath?: StackGroupPath
  readonly file?: File
  readonly dir: Dir
  readonly children: StackGroupConfigNode[]
  readonly stacks: StackConfigNode[]
}
