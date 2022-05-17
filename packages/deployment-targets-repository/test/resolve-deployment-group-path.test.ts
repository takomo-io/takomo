import { OUPath } from "@takomo/aws-model"
import { DeploymentGroupPath } from "@takomo/deployment-targets-model"
import { resolveDeploymentGroupPath } from "../src/organization-deployment-target-repository"

const cases: Array<
  [OUPath, DeploymentGroupPath | undefined, DeploymentGroupPath]
> = [
  ["ROOT", undefined, "ROOT"],
  ["ROOT/Workloads/Dev", undefined, "ROOT/Workloads/Dev"],
  ["ROOT", "Abc", "Abc"],
  ["ROOT/Workloads/Dev", "Abc", "Abc/Workloads/Dev"],
  ["ROOT", "hello/world", "hello/world"],
  ["ROOT/Workloads/Dev", "hello/world", "hello/world/Workloads/Dev"],
]

describe("#resolveDeploymentGroupPath", () => {
  test.each(cases)(
    "when ou path '%s' and root deployment group path '%s' are given, returns '%s'",
    (ouPath, rootDeploymentGroupPath, expected) => {
      expect(
        resolveDeploymentGroupPath(ouPath, rootDeploymentGroupPath),
      ).toStrictEqual(expected)
    },
  )
})
