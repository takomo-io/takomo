import {
  isTerminalResourceStatus,
  ResourceStatus,
} from "../../src/takomo-aws-model"

const cases: Array<[ResourceStatus, boolean]> = [
  ["CREATE_IN_PROGRESS", false],
  ["CREATE_FAILED", true],
  ["CREATE_COMPLETE", true],
  ["DELETE_IN_PROGRESS", false],
  ["DELETE_FAILED", true],
  ["DELETE_COMPLETE", true],
  ["DELETE_SKIPPED", false],
  ["UPDATE_IN_PROGRESS", false],
  ["UPDATE_FAILED", false],
  ["UPDATE_COMPLETE", true],
  ["IMPORT_FAILED", true],
  ["IMPORT_COMPLETE", true],
  ["IMPORT_IN_PROGRESS", false],
  ["IMPORT_ROLLBACK_IN_PROGRESS", false],
  ["IMPORT_ROLLBACK_FAILED", true],
  ["IMPORT_ROLLBACK_COMPLETE", true],
  ["ROLLBACK_COMPLETE", true],
  ["ROLLBACK_FAILED", true],
  ["UPDATE_ROLLBACK_COMPLETE", true],
  ["UPDATE_ROLLBACK_FAILED", true],
]

describe("#isTerminalResourceStatus", () => {
  test.each(cases)("When % is given returns %s", (status, expected) => {
    expect(isTerminalResourceStatus(status)).toStrictEqual(expected)
  })
})
