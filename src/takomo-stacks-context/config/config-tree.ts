import { StackConfig, StackGroupConfig } from "../../takomo-stacks-config"
import {
  StackGroupName,
  StackGroupPath,
  StackPath,
} from "../../takomo-stacks-model"

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
