import { parseFeaturesFromArgs } from "../../src/cli/options/parse-features-from-args.js"
import { Features } from "../../src/config/project-config.js"

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
