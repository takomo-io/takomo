import Joi from "joi"
import { createStacksSchemas } from "../../../src/schema/stacks-schema.js"
import { expectNoValidationError } from "../../assertions.js"

const { template } = createStacksSchemas({
  regions: [],
})

const inline = "Resources:\n  LogGroup:\n    Type: AWS::Logs::Group"

const valid = [
  { template: "vpc.yml" },
  { template: "network/subnets.yml" },
  { template: { dynamic: true } },
  { template: { dynamic: false } },
  { template: { filename: "file.yml" } },
  { template: { filename: "file1.yml", dynamic: false } },
  { template: { filename: "file2.yml", dynamic: true } },
  {
    template: { inline },
  },
  {
    template: {
      inline,
      dynamic: false,
    },
  },
  {
    template: {
      inline,
      dynamic: true,
    },
  },
]

const s = Joi.object({ template })

describe("timeout validation", () => {
  test.each(valid)("succeeds when '%s' is given", (value) => {
    expectNoValidationError(s)(value)
  })
})
