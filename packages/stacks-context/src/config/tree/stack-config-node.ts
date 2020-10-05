import { StackPath } from "@takomo/core"
import { File } from "@takomo/util"

export interface StackConfigNode {
  readonly path: StackPath
  readonly file: File
}
