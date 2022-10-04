import { createCommonSchema } from "../../src/takomo-core"
import { expectNoValidationError, expectValidationErrors } from "../assertions"

const { json } = createCommonSchema()

const valid = ["{}", '{"Action":"Allow"}', { Action: "Allow" }]

const invalid: Array<[any, any]> = [
  ["", '"value" is not valid JSON: Unexpected end of JSON input'],
  [
    "{ssdjksd:",
    '"value" is not valid JSON: Unexpected token s in JSON at position 1',
  ],
  [1, '"value" must be a string or object'],
  [true, '"value" must be a string or object'],
  [["x"], '"value" must be a string or object'],
]

describe("json validation", () => {
  test.each(invalid)("fails when '%s' is given", expectValidationErrors(json))
  test.each(valid)("succeeds when '%s' is given", expectNoValidationError(json))
})
