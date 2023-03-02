import { mock } from "jest-mock-extended"
import { createDeploymentTargetNamePatternMatcher } from "../../src/command/targets/common/plan/create-deployment-target-name-pattern-matcher.js"
import { DeploymentTargetConfig } from "../../src/takomo-deployment-targets-config.js"
import { DeploymentTargetName } from "../../src/takomo-deployment-targets-model.js"

const target = (name: DeploymentTargetName): DeploymentTargetConfig =>
  mock<DeploymentTargetConfig>({ name })

describe("#createDeploymentTargetNamePatternMatcher", () => {
  test("Without wildcard", () => {
    const m = createDeploymentTargetNamePatternMatcher("hello")
    expect(m(target("hello"))).toStrictEqual(true)
    expect(m(target("wellhello"))).toStrictEqual(false)
    expect(m(target("helloworld"))).toStrictEqual(false)
    expect(m(target("wellhelloworld"))).toStrictEqual(false)
  })
  test("With ending wildcard", () => {
    const m = createDeploymentTargetNamePatternMatcher("hello%")
    expect(m(target("hello"))).toStrictEqual(true)
    expect(m(target("wellhello"))).toStrictEqual(false)
    expect(m(target("helloworld"))).toStrictEqual(true)
    expect(m(target("wellhelloworld"))).toStrictEqual(false)
  })
  test("With starting wildcard", () => {
    const m = createDeploymentTargetNamePatternMatcher("%hello")
    expect(m(target("hello"))).toStrictEqual(true)
    expect(m(target("wellhello"))).toStrictEqual(true)
    expect(m(target("helloworld"))).toStrictEqual(false)
    expect(m(target("wellhelloworld"))).toStrictEqual(false)
  })
  test("With ending and starting wildcards", () => {
    const m = createDeploymentTargetNamePatternMatcher("%hello%")
    expect(m(target("hello"))).toStrictEqual(true)
    expect(m(target("wellhello"))).toStrictEqual(true)
    expect(m(target("helloworld"))).toStrictEqual(true)
    expect(m(target("wellhelloworld"))).toStrictEqual(true)
  })
})
