import { DeployOrganizationOutput } from "@takomo/organization-commands"
import { executeDeployOrganizationCommand } from "@takomo/test-integration"
import dedent from "ts-dedent"
import {
  ORG_3_ACCOUNT_01_EMAIL,
  ORG_3_ACCOUNT_01_ID,
  ORG_3_ACCOUNT_01_NAME,
} from "./env"

const deployOrganizationSucceeds = async (
  projectDir: string,
): Promise<DeployOrganizationOutput> =>
  executeDeployOrganizationCommand({
    projectDir,
  })
    .expectCommandToSucceed()
    .assert()

const deployOrganizationFails = async (
  projectDir: string,
  message: string,
  errorMessage?: string,
): Promise<DeployOrganizationOutput> =>
  executeDeployOrganizationCommand({
    projectDir,
  })
    .expectCommandToFail(message, errorMessage)
    .assert()

const deployOrganizationThrows = async (
  projectDir: string,
  errorMessage: string,
): Promise<void> =>
  executeDeployOrganizationCommand({
    projectDir,
  }).expectCommandToThrowWithMessage(errorMessage)

describe("Organization commands", () => {
  test("Simple configuration", () =>
    deployOrganizationSucceeds("configs/simple"))
  test("Load accounts using filesystem account repository", () =>
    deployOrganizationSucceeds("configs/filesystem-account-repository"))
  test("All accounts must be present in local config", () =>
    deployOrganizationFails(
      "configs/all-accounts-not-present-in-local-config",
      "Error",
      "The organization has 1 active account(s) that are not found from the local configuration:\n\n" +
        `  - id: ${ORG_3_ACCOUNT_01_ID}, email: ${ORG_3_ACCOUNT_01_EMAIL}, name: ${ORG_3_ACCOUNT_01_NAME}`,
    ))
  test("File system account repository account files must be valid", () =>
    deployOrganizationThrows(
      "configs/filesystem-account-repository-invalid-account-file",
      dedent`
      Validation errors in account configuration '${process.cwd()}/configs/filesystem-account-repository-invalid-account-file/organization/accounts/account01.yml':

        - "id" is required
      `,
    ))
  test("Accounts loaded from account repository must not contain OUs not present in the local configuration", () =>
    deployOrganizationThrows(
      "configs/filesystem-account-repository-unknown-ou",
      dedent`
      Accounts loaded from account repository contain 1 organizational units that do not exists in organization configuration file:
      
        - Root/Unknown
      `,
    ))
})
