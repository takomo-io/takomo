import { expectNoValidationError } from "@takomo/test-unit"
import { takomoProjectConfigFileSchema } from "../src/config"

const valid = [
  {},
  { requiredVersion: "1.0.0" },
  { regions: ["eu-west-1"] },
  { features: { deploymentTargetsUndeploy: true } },
  {
    regions: ["eu-central-1"],
    features: { deploymentTargetsUndeploy: false },
  },
]

describe("project config schema validation", () => {
  test.each(valid)(
    "success %#",
    expectNoValidationError(takomoProjectConfigFileSchema),
  )
})
