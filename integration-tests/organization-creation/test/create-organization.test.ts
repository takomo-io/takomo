import { initOptionsAndVariables } from "@takomo/cli"
import { CliCreateOrganizationIO } from "@takomo/cli-io"
import { CommandStatus, Options } from "@takomo/core"
import { createOrganizationCommand } from "@takomo/organization"
import { fileExists, parseYamlFile } from "@takomo/util"
import rimfaf from "rimraf"
import { aws } from "./aws-api"
import { ORG_B_MASTER_ACCOUNT_ID } from "./env"
import { TIMEOUT } from "./test-constants"

class TestCreateOrganizationIO extends CliCreateOrganizationIO {
  constructor(options: Options) {
    super(options)
  }
}

const cleanOrganizationDir = async (): Promise<boolean> =>
  new Promise((resolve, reject) => {
    rimfaf("./configs/no-existing-config/*", (err) => {
      if (err) reject(err)
      else resolve(true)
    })
  })

const createOptions = async (projectDir: string) =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: projectDir,
  })

// First, make sure that there is no existing organization left from previous test runs
beforeEach(async () => {
  await aws.organizations.deleteOrganizationIfPresent()
  await cleanOrganizationDir()
}, TIMEOUT)

afterAll(async () => {
  await aws.organizations.deleteOrganizationIfPresent()
}, TIMEOUT)

describe("Create organization command", () => {
  test(
    "with 'all' feature set",
    async () => {
      const { options, variables, watch } = await createOptions(
        "configs/no-existing-config",
      )
      const {
        success,
        status,
        message,
        organization,
        configurationFile,
      } = await createOrganizationCommand(
        {
          featureSet: "ALL",
          watch,
          variables,
          options,
        },
        new TestCreateOrganizationIO(options),
      )

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")
      expect(organization?.MasterAccountId).toBe(ORG_B_MASTER_ACCOUNT_ID)
      expect(organization?.FeatureSet).toBe("ALL")

      const pathToOrganizationFile =
        "./configs/no-existing-config/organization/organization.yml"
      expect(await fileExists(pathToOrganizationFile)).toBeTruthy()
      expect(await fileExists(configurationFile!)).toBeTruthy()

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
      const { options, variables, watch } = await createOptions(
        "configs/no-existing-config",
      )
      const {
        success,
        status,
        message,
        organization,
      } = await createOrganizationCommand(
        {
          featureSet: "CONSOLIDATED_BILLING",
          watch,
          variables,
          options,
        },
        new TestCreateOrganizationIO(options),
      )

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")
      expect(organization?.MasterAccountId).toBe(ORG_B_MASTER_ACCOUNT_ID)
      expect(organization?.FeatureSet).toBe("CONSOLIDATED_BILLING")
    },
    TIMEOUT,
  )

  test(
    "with existing organization config file that has correct master account id",
    async () => {
      const { options, variables, watch } = await createOptions(
        "configs/existing-config-valid",
      )
      const {
        success,
        status,
        message,
        organization,
      } = await createOrganizationCommand(
        {
          featureSet: "ALL",
          watch,
          variables,
          options,
        },
        new TestCreateOrganizationIO(options),
      )

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")
      expect(organization?.MasterAccountId).toBe(ORG_B_MASTER_ACCOUNT_ID)
      expect(organization?.FeatureSet).toBe("ALL")
    },
    TIMEOUT,
  )

  test(
    "with existing organization config file that has incorrect master account id",
    async () => {
      const { options, variables, watch } = await createOptions(
        "configs/existing-config-invalid",
      )
      const createOrganization = () =>
        createOrganizationCommand(
          {
            featureSet: "ALL",
            watch,
            variables,
            options,
          },
          new TestCreateOrganizationIO(options),
        )

      expect(createOrganization).rejects.toThrowError(
        "An exiting organization configuration file found but its masterAccountId property does not match with the account id of current credentials",
      )
    },
    TIMEOUT,
  )
})
