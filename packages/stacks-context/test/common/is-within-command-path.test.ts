import { isWithinCommandPath } from "../../src/common"

type Case = [string, string, boolean]

const cases: Array<Case> = [
  ["/", "/", true],
  ["/dev", "/test", false],
  ["/", "/dev", true],
  ["/", "/dev/app.yml", true],
  ["/", "/dev/app.yml/eu-west-1", true],
  ["/dev", "/dev/app.yml/eu-west-1", true],
  ["/dev/app.yml", "/dev/app.yml/eu-west-1", true],
  ["/dev/app.yml/eu-west-1", "/dev/app.yml/eu-west-1", true],
  ["/dev/app.yml/eu-west-1", "/dev/app.yml/us-east-1", false],
  ["/test/app.yml/eu-west-1", "/dev/app.yml/eu-west-1", false],
]

describe("#isWithinCommandPath", () => {
  test.each(cases)(
    "when commandPath is '%s' and other path is '%s' returns %s",
    (commandPath, other, expected) => {
      expect(isWithinCommandPath(commandPath, other)).toBe(expected)
    },
  )
})
