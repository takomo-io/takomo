import { DeployOrganizationOutput } from "@takomo/organization-commands"
import { executeDeployOrganizationCommand } from "@takomo/test-integration"
import dedent from "ts-dedent"
import {
  ORG_3_ACCOUNT_01_EMAIL,
  ORG_3_ACCOUNT_01_ID,
  ORG_3_ACCOUNT_01_NAME,
  ORG_3_ACCOUNT_02_ID,
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
  test("Load accounts using filesystem account repository with infer OU path", () =>
    deployOrganizationSucceeds(
      "configs/filesystem-account-repository-infer-ou-path",
    ))
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
      Validation errors in organization configuration file ${process.cwd()}/configs/filesystem-account-repository-unknown-ou/organization/organization.yml:
      
        - Organizational unit 'Root/Unknown' is not found from the configuration file but is referenced in externally configured accounts.`,
    ))
  test("Accounts loaded from account repository must not contain duplicate account ids", () =>
    deployOrganizationThrows(
      "configs/filesystem-account-repository-duplicate-external-account-ids",
      dedent`
      Validation errors in organization configuration file ${process.cwd()}/configs/filesystem-account-repository-duplicate-external-account-ids/organization/organization.yml:
      
        - Account '${ORG_3_ACCOUNT_01_ID}' is specified more than once in the externally configured accounts`,
    ))
  test("Accounts loaded from account repository must not contain account ids found from the configuration file", () =>
    deployOrganizationThrows(
      "configs/filesystem-account-repository-duplicate-account-ids",
      dedent`
      Validation errors in organization configuration file ${process.cwd()}/configs/filesystem-account-repository-duplicate-account-ids/organization/organization.yml:
      
        - Account '${ORG_3_ACCOUNT_02_ID}' is defined more than once in the configuration.`,
    ))
})
