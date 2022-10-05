import { inferDeploymentTargetName } from "../../src/takomo-deployment-targets-repository/filesystem-deployment-target-repository"

const cases: string[][] = [
  ["/targets/workloads/target.yml", "target"],
  ["/tmp/app/prod/app-dev.yml", "app-dev"],
  ["/appx.yml", "appx"],
]

describe("#resolveDeploymentTargetName", () => {
  test.each(cases)(
    "returns %s when the file path is %s",
    (pathToFile, expected) => {
      expect(inferDeploymentTargetName(pathToFile)).toStrictEqual(expected)
    },
  )
})
