import { StackConfig } from "../../config/stack-config.js"
import { StackGroupConfig } from "../../config/stack-group-config.js"
import { StackGroupName, StackGroupPath } from "../../stacks/stack-group.js"
import { StackPath } from "../../stacks/stack.js"

export interface StackConfigNode {
  readonly path: StackPath
  readonly getConfig: (variables: any) => Promise<StackConfig>
}

export interface StackGroupConfigNode {
  readonly path: StackGroupPath
  readonly name: StackGroupName
  readonly parentPath?: StackGroupPath
  readonly getConfig: (variables: any) => Promise<StackGroupConfig | undefined>
  readonly children: ReadonlyArray<StackGroupConfigNode>
  readonly stacks: ReadonlyArray<StackConfigNode>
}

export interface ConfigTree {
  readonly rootStackGroup: StackGroupConfigNode
}
