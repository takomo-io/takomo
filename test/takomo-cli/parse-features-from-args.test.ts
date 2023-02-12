import { parseFeaturesFromArgs } from "../../src/cli/options/parse-features-from-args"
import { Features } from "../../src/takomo-core"

const cases: Array<[any, Partial<Features>]> = [
  [undefined, {}],
  [null, {}],
  [[], {}],
  ["deploymentTargetsUndeploy=true", { deploymentTargetsUndeploy: true }],
  ["deploymentTargetsUndeploy=false", { deploymentTargetsUndeploy: false }],
  ["deploymentTargetsTearDown=true", { deploymentTargetsTearDown: true }],
  ["deploymentTargetsTearDown=false", { deploymentTargetsTearDown: false }],
  [["deploymentTargetsTearDown=false"], { deploymentTargetsTearDown: false }],
  [
    ["deploymentTargetsTearDown=true", "deploymentTargetsUndeploy=true"],
    {
      deploymentTargetsTearDown: true,
      deploymentTargetsUndeploy: true,
    },
  ],
]

describe("parseFeaturesFromArgs", () => {
  test.each(cases)("%#", (given, expected) => {
    expect(parseFeaturesFromArgs(given)).toStrictEqual(expected)
  })
})
