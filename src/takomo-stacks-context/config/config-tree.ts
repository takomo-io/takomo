import { StackConfig } from "../../config/stack-config"
import { StackGroupConfig } from "../../config/stack-group-config"
import { StackPath } from "../../stacks/stack"
import { StackGroupName, StackGroupPath } from "../../stacks/stack-group"

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
