import { inferOUPathFromFilePath } from "../src/filesystem-account-repository"

const cases: string[][] = [
  ["/accounts", "/accounts/workloads/account.yml", "workloads"],
  ["/tmp", "/tmp/app/prod/t.yml", "app/prod"],
]

describe("#inferOUPathFromFilePath", () => {
  test.each(cases)(
    "returns %s when base dir is %s and path to file is %s",
    (baseDir, pathToFile, expected) => {
      expect(inferOUPathFromFilePath(baseDir, pathToFile)).toStrictEqual(
        expected,
      )
    },
  )

  test("Throws an error if target file is directly in the base dir", () => {
    expect(() => inferOUPathFromFilePath("/tmp", "/tmp/account.yml")).toThrow(
      "Account file /tmp/account.yml must not be directly in /tmp dir",
    )
  })
})
