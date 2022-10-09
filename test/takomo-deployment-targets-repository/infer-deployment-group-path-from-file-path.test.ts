import { inferDeploymentGroupPathFromFilePath } from "../../src/takomo-deployment-targets-repository/filesystem-deployment-target-repository"

const cases: string[][] = [
  ["/targets", "/targets/workloads/target.yml", "workloads"],
  ["/tmp", "/tmp/app/prod/t.yml", "app/prod"],
]

describe("#inferDeploymentGroupPathFromFilePath", () => {
  test.each(cases)(
    "returns %s when base dir is %s and path to file is %s",
    (baseDir, pathToFile, expected) => {
      expect(
        inferDeploymentGroupPathFromFilePath(baseDir, pathToFile),
      ).toStrictEqual(expected)
    },
  )

  test("Throws an error if target file is directly in the base dir", () => {
    expect(() =>
      inferDeploymentGroupPathFromFilePath("/tmp", "/tmp/target.yml"),
    ).toThrow(
      "Deployment target file /tmp/target.yml must not be directly in /tmp dir",
    )
  })
})
