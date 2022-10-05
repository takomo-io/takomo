import { TemplateBucketConfig, TimeoutConfig } from "./common"
import { StackPath } from "./stack"

export const ROOT_STACK_GROUP_PATH = "/"

export const StackPropertyDefaults = {
  inheritTags: (): boolean => true,
  depends: (): ReadonlyArray<StackPath> => [],
  timeout: (): TimeoutConfig => ({ create: 0, update: 0 }),
  templateBucket: (): TemplateBucketConfig | undefined => undefined,
}
