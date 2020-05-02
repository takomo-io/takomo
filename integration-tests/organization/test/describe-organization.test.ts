import { initOptionsAndVariables } from "@takomo/cli"
import { CliDescribeOrganizationIO } from "@takomo/cli-io"
import { CommandStatus } from "@takomo/core"
import { describeOrganizationCommand } from "@takomo/organization"
import { aws } from "./aws-api"
import {
  ORG_A_ID,
  ORG_A_MASTER_ACCOUNT_ID,
  ORG_A_MASTER_ACCOUNT_NAME,
} from "./env"
import { TIMEOUT } from "./test-constants"

const createOptions = async (version: string) =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs",
    var: `configVersion=${version}.yml`,
  })

describe("Describe organization command", () => {
  it(
    "returns correct output",
    async () => {
      const { options, variables, watch } = await createOptions("v01")
      const output = await describeOrganizationCommand(
        {
          watch,
          variables,
          options,
        },
        new CliDescribeOrganizationIO(options),
      )

      const {
        organization,
        success,
        status,
        message,
        masterAccount,
        enabledPolicies,
        services,
      } = output

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")

      expect(masterAccount.Name).toBe(ORG_A_MASTER_ACCOUNT_NAME)
      expect(masterAccount.Status).toBe("ACTIVE")
      expect(masterAccount.Id).toBe(ORG_A_MASTER_ACCOUNT_ID)

      expect(organization.FeatureSet).toBe("ALL")
      expect(organization.MasterAccountId).toBe(ORG_A_MASTER_ACCOUNT_ID)
      expect(organization.Id).toBe(ORG_A_ID)

      const actualEnabledPolicies = await aws.organizations.getEnabledPolicyTypes()

      expect(enabledPolicies.slice().sort()).toStrictEqual(
        actualEnabledPolicies.slice().sort(),
      )

      expect(services.map(s => s.ServicePrincipal)).toStrictEqual([
        "aws-artifact-account-sync.amazonaws.com",
        "cloudtrail.amazonaws.com",
        "config.amazonaws.com",
        "ds.amazonaws.com",
        "fms.amazonaws.com",
        "license-manager.amazonaws.com",
        "ram.amazonaws.com",
        "servicecatalog.amazonaws.com",
        "ssm.amazonaws.com",
        "sso.amazonaws.com",
        "tagpolicies.tag.amazonaws.com",
      ])
    },
    TIMEOUT,
  )
})
