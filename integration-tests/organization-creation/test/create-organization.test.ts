import {
  aws,
  executeCreateOrganizationCommand,
  TIMEOUT,
} from "@takomo/test-integration"
import { fileExists, parseYamlFile, sleep } from "@takomo/util"
import { unlink } from "fs"
import { ORG_B_MASTER_ACCOUNT_ID } from "./env"

// First, make sure that there is no existing organization left from previous test runs
beforeEach(async () => {
  await aws.organizations.deleteOrganizationIfPresent()
  await sleep(10000)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await unlink("./configs/organization/organization.yml", () => {})
}, TIMEOUT)

afterAll(async () => {
  await aws.organizations.deleteOrganizationIfPresent()
}, TIMEOUT)

describe("Create organization", () => {
  test(
    "with 'all' feature set",
    async () => {
      const { organization } = await executeCreateOrganizationCommand({
        projectDir: "configs",
        featureSet: "ALL",
      })
        .expectCommandToSucceed()
        .assert({
          masterAccountId: ORG_B_MASTER_ACCOUNT_ID,
          featureSet: "ALL",
        })

      if (!organization) {
        fail("Expected organization to be defined")
      }

      expect(organization.masterAccountId).toBe(ORG_B_MASTER_ACCOUNT_ID)
      expect(organization.featureSet).toBe("ALL")

      const pathToOrganizationFile = "./configs/organization/organization.yml"
      expect(await fileExists(pathToOrganizationFile)).toBeTruthy()

      const parsedOrganizationFile = await parseYamlFile(pathToOrganizationFile)
      expect(parsedOrganizationFile.masterAccountId).toEqual(
        ORG_B_MASTER_ACCOUNT_ID,
      )
    },
    TIMEOUT,
  )

  test(
    "with 'consolidated billing' feature set",
    async () => {
      const { organization } = await executeCreateOrganizationCommand({
        projectDir: "configs",
        featureSet: "CONSOLIDATED_BILLING",
      })
        .expectCommandToSucceed()
        .assert({
          masterAccountId: ORG_B_MASTER_ACCOUNT_ID,
          featureSet: "CONSOLIDATED_BILLING",
        })

      if (!organization) {
        fail("Expected organization to be defined")
      }

      expect(organization.masterAccountId).toBe(ORG_B_MASTER_ACCOUNT_ID)
      expect(organization.featureSet).toBe("CONSOLIDATED_BILLING")

      const pathToOrganizationFile = "./configs/organization/organization.yml"
      expect(await fileExists(pathToOrganizationFile)).toBeTruthy()

      const parsedOrganizationFile = await parseYamlFile(pathToOrganizationFile)
      expect(parsedOrganizationFile.masterAccountId).toEqual(
        ORG_B_MASTER_ACCOUNT_ID,
      )
    },
    TIMEOUT,
  )
})
