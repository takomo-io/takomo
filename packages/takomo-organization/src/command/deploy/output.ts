import { resolveCommandOutputBase } from "@takomo/core"
import { OrganizationBasicConfigCleanResultHolder } from "../../model"
import { DeployOrganizationOutput } from "./model"

export const buildOutput = (
  holder: OrganizationBasicConfigCleanResultHolder,
): DeployOrganizationOutput => {
  const {
    watch,
    organizationalUnitsDeploymentResult,
    organizationalUnitsCleanResult,
    policiesDeploymentResult,
    policiesCleanResult,
    organizationBasicConfigDeploymentResult,
    organizationBasicConfigCleanResult,
  } = holder

  const results = [
    organizationalUnitsDeploymentResult,
    organizationalUnitsCleanResult,
    policiesDeploymentResult,
    policiesCleanResult,
    organizationBasicConfigCleanResult,
  ]

  return {
    ...resolveCommandOutputBase(results),
    watch: watch.stop(),
    organizationalUnitsCleanResult,
    organizationalUnitsDeploymentResult,
    policiesCleanResult,
    policiesDeploymentResult,
    basicConfigDeploymentResult: organizationBasicConfigDeploymentResult,
    basicConfigCleanResult: organizationBasicConfigCleanResult,
  }
}
