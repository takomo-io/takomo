import { organizationalUnitPath } from "../../src/config/schema"
import { expectNoValidationError, expectValidationErrors } from "../helpers"

const valid = [
  "Root",
  "Root/Example",
  "Root/my-group",
  "Root/_with_underscores",
  "Root/Spaces are allowed",
  "Root/nested/path",
  "Root/Path/Dev Accounts/dev1",
]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  ["Root/subsequent  whites", '"value" must not contain subsequent whitespace'],
  ["Root/end/", '"value" must not end with path separator (/)'],
  [
    "Root/too/deep/paths/not/allowed",
    '"value" hierarchy depth must not exceed 5',
  ],
  [
    "Root/invalid//separator",
    '"value" must not contain subsequent path separators (/)',
  ],
  [
    " Root/starts with whitespace",
    '"value" with value " Root/starts with whitespace" fails to match the required pattern: /^Root(\\/[a-zA-Z0-9-_/ ]+)?$/',
  ],
  ["Root/ends with whitespace ", '"value" must not end with whitespace'],
  [
    "Root/" + "x".repeat(129 * 5 - 5),
    '"value" length must be less than or equal to 644 characters long',
  ],
]

describe("organizational unit path validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(organizationalUnitPath),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(organizationalUnitPath),
  )
})
