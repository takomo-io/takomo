import { Features } from "../../src/config/project-config"
import { parseFeatures } from "../../src/parser/project-config-parser"

const cases: Array<[any, Features]> = [
  [
    {},
    {
      deploymentTargetsUndeploy: true,
      deploymentTargetsTearDown: true,
    },
  ],
  [
    null,
    {
      deploymentTargetsUndeploy: true,
      deploymentTargetsTearDown: true,
    },
  ],
  [
    undefined,
    {
      deploymentTargetsUndeploy: true,
      deploymentTargetsTearDown: true,
    },
  ],
  [
    { deploymentTargetsUndeploy: false },
    {
      deploymentTargetsUndeploy: false,
      deploymentTargetsTearDown: true,
    },
  ],
  [
    { deploymentTargetsUndeploy: true },
    {
      deploymentTargetsUndeploy: true,
      deploymentTargetsTearDown: true,
    },
  ],
  [
    {
      deploymentTargetsUndeploy: false,
      deploymentTargetsTearDown: false,
    },
    {
      deploymentTargetsUndeploy: false,
      deploymentTargetsTearDown: false,
    },
  ],
]

describe("#parseFeatures", () => {
  test.each(cases)("%#", (given, expected) => {
    expect(parseFeatures(given)).toStrictEqual(expected)
  })
})
