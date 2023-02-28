import { Features } from "../../src/config/project-config"
import { parseFeatures } from "../../src/parser/project-config-parser"

const cases: Array<[any, Features]> = [
  [
    {},
    {
      deploymentTargetsUndeploy: true,
    },
  ],
  [
    null,
    {
      deploymentTargetsUndeploy: true,
    },
  ],
  [
    undefined,
    {
      deploymentTargetsUndeploy: true,
    },
  ],
  [
    { deploymentTargetsUndeploy: false },
    {
      deploymentTargetsUndeploy: false,
    },
  ],
  [
    { deploymentTargetsUndeploy: true },
    {
      deploymentTargetsUndeploy: true,
    },
  ],
  [
    {
      deploymentTargetsUndeploy: false,
    },
    {
      deploymentTargetsUndeploy: false,
    },
  ],
]

describe("#parseFeatures", () => {
  test.each(cases)("%#", (given, expected) => {
    expect(parseFeatures(given)).toStrictEqual(expected)
  })
})
