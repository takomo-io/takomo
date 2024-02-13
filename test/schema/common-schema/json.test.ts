import { createCommonSchema } from "../../../src/schema/common-schema.js"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "../../assertions.js"

const { json } = createCommonSchema()

const valid = ["{}", '{"Action":"Allow"}', { Action: "Allow" }]

const invalid: Array<[string | number | boolean | string[], string]> = [
  ["", '"value" is not valid JSON: Unexpected end of JSON input'],
  [
    "{ssdjksd:",
    "\"value\" is not valid JSON: Expected property name or '}' in JSON at position 1",
  ],
  [1, '"value" must be a string or object'],
  [true, '"value" must be a string or object'],
  [["x"], '"value" must be a string or object'],
]

describe("json validation", () => {
  test.each(invalid)("fails when '%s' is given", expectValidationErrors(json))
  test.each(valid)("succeeds when '%s' is given", expectNoValidationError(json))
})
