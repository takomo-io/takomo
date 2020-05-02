import { initOptionsAndVariables } from "@takomo/cli"
import { CliCreateOrganizationIO } from "@takomo/cli-io"
import { CommandStatus, Options } from "@takomo/core"
import { createOrganizationCommand } from "@takomo/organization"
import { aws } from "./aws-api"
import { ORG_B_MASTER_ACCOUNT_ID } from "./env"
import { TIMEOUT } from "./test-constants"

class TestCreateOrganizationIO extends CliCreateOrganizationIO {
  constructor(options: Options) {
    super(options)
  }
}

const createOptions = async () =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs",
  })

// First, make sure that there is no existing organization left from previous test runs
beforeEach(async () => {
  await aws.organizations.deleteOrganizationIfPresent()
}, TIMEOUT)

afterAll(async () => {
  await aws.organizations.deleteOrganizationIfPresent()
}, TIMEOUT)

describe("Create organization command", () => {
  it(
    "with 'all' feature set",
    async () => {
      const { options, variables, watch } = await createOptions()
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

  it(
    "with 'consolidated billing' feature set",
    async () => {
      const { options, variables, watch } = await createOptions()
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
})
