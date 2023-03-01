import { DeploymentTargetConfig } from "../../../../config/targets-config.js"
import { DeploymentTargetNamePattern } from "../../../../targets/targets-model.js"

type Matcher = (target: DeploymentTargetConfig) => boolean

export const createDeploymentTargetNamePatternMatcher = (
  pattern: DeploymentTargetNamePattern,
): Matcher => {
  const prefix = pattern.endsWith("%")
  const suffix = pattern.startsWith("%")
  if (prefix && suffix) {
    const part = pattern.slice(1, -1)
    return ({ name }) => name.includes(part)
  }
  if (prefix) {
    const part = pattern.slice(0, -1)
    return ({ name }) => name.startsWith(part)
  }
  if (suffix) {
    const part = pattern.slice(1)
    return ({ name }) => name.endsWith(part)
  }
  return ({ name }) => name === pattern
}
