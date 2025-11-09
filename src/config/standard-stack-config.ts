import {
  StackCapability,
  StackPolicyBody,
} from "../aws/cloudformation/model.js"
import { TemplateBucketConfig } from "../common/model.js"
import { BlueprintPath } from "../stacks/standard-stack.js"
import { TemplateConfig } from "./common-config.js"
import { StackConfig } from "./stack-config.js"
import { isCustomStackConfig } from "./custom-stack-config.js"

export interface StandardStackConfig extends StackConfig {
  readonly template?: TemplateConfig
  readonly templateBucket?: TemplateBucketConfig
  readonly capabilities?: ReadonlyArray<StackCapability>
  readonly stackPolicy?: StackPolicyBody
  readonly stackPolicyDuringUpdate?: StackPolicyBody
  readonly blueprint?: BlueprintPath
}

export const isStandardStackConfig = (
  config: StackConfig,
): config is StandardStackConfig => !isCustomStackConfig(config)
