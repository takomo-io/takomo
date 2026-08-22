import {
  isRelatedToCommandPath,
  isWithinCommandPath,
} from "../../src/takomo-stacks-model/util.js"

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
  ["/dev", "/development/app.yml/eu-west-1", false],
]

describe("#isWithinCommandPath", () => {
  test.each(cases)(
    "when command path is '%s' and path is '%s' returns %s",
    (commandPath, path, expected) => {
      expect(isWithinCommandPath(commandPath, path)).toBe(expected)
    },
  )
})

describe("#isRelatedToCommandPath", () => {
  test.each([
    ["/dev", "/dev/app.yml/eu-west-1", true],
    ["/dev/app.yml/eu-west-1", "/dev", true],
    ["/development", "/dev", false],
  ] satisfies Array<Case>)(
    "when command path is '%s' and path is '%s' returns %s",
    (commandPath, path, expected) => {
      expect(isRelatedToCommandPath(commandPath, path)).toBe(expected)
    },
  )
})
