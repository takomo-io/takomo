import { Features } from "@takomo/core"
import { parseFeaturesFromArgs } from "../src/common"

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
