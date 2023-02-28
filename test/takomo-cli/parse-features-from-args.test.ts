import { parseFeaturesFromArgs } from "../../src/cli/options/parse-features-from-args"
import { Features } from "../../src/config/project-config"

const cases: Array<[any, Partial<Features>]> = [
  [undefined, {}],
  [null, {}],
  [[], {}],
  ["deploymentTargetsUndeploy=true", { deploymentTargetsUndeploy: true }],
  ["deploymentTargetsUndeploy=false", { deploymentTargetsUndeploy: false }],
]

describe("parseFeaturesFromArgs", () => {
  test.each(cases)("%#", (given, expected) => {
    expect(parseFeaturesFromArgs(given)).toStrictEqual(expected)
  })
})
