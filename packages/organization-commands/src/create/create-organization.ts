import { CredentialManager } from "@takomo/aws-clients"
import { DEFAULT_STAGE_NAME } from "@takomo/config-sets"
import { CommandContext } from "@takomo/core"
import { OrganizationConfig } from "@takomo/organization-config"
import { OrganizationConfigRepository } from "@takomo/organization-context"
import { DEFAULT_ORGANIZATION_ROLE_NAME } from "@takomo/organization-model"
import { createTimer, uuid } from "@takomo/util"
import {
  CreateOrganizationInput,
  CreateOrganizationIO,
  CreateOrganizationOutput,
} from "./model"

export const createOrganization = async (
  ctx: CommandContext,
  configRepository: OrganizationConfigRepository,
  input: CreateOrganizationInput,
  io: CreateOrganizationIO,
  credentialManager: CredentialManager,
): Promise<CreateOrganizationOutput> => {
  const timer = createTimer("total")
  const { featureSet } = input

  const identity = await credentialManager.getCallerIdentity()

  if (
    !ctx.autoConfirmEnabled &&
    !(await io.confirmOrganizationCreation(identity.accountId, featureSet))
  ) {
    timer.stop()
    return {
      timer,
      message: "Cancelled",
      status: "CANCELLED",
      success: true,
      outputFormat: input.outputFormat,
    }
  }

  const credentials = await credentialManager.getCredentials()
  const client = ctx.awsClientProvider.createOrganizationsClient({
    credentials,
    logger: io,
    region: "us-east-1",
    id: uuid(),
  })

  try {
    const organization = await client.createOrganization(featureSet)

    // TODO: Specify this default config somewhere?
    const organizationConfig: OrganizationConfig = {
      masterAccountId: identity.accountId,
      accountBootstrapRoleName: DEFAULT_ORGANIZATION_ROLE_NAME,
      accountAdminRoleName: DEFAULT_ORGANIZATION_ROLE_NAME,
      vars: {},
      stages: [DEFAULT_STAGE_NAME],
      accountCreation: {
        constraints: {},
        defaults: {
          iamUserAccessToBilling: true,
          roleName: DEFAULT_ORGANIZATION_ROLE_NAME,
        },
      },
      aiServicesOptOutPolicies: {
        enabled: false,
        policies: [],
        policyType: "AISERVICES_OPT_OUT_POLICY",
      },
      backupPolicies: {
        enabled: false,
        policies: [],
        policyType: "BACKUP_POLICY",
      },
      configSets: [],
      serviceControlPolicies: {
        enabled: false,
        policies: [],
        policyType: "SERVICE_CONTROL_POLICY",
      },
      tagPolicies: {
        enabled: false,
        policies: [],
        policyType: "TAG_POLICY",
      },
      organizationalUnits: {
        Root: {
          accountBootstrapRoleName: DEFAULT_ORGANIZATION_ROLE_NAME,
          accountAdminRoleName: DEFAULT_ORGANIZATION_ROLE_NAME,
          name: "Root",
          path: "Root",
          status: "active",
          priority: 0,
          children: [],
          configSets: [],
          bootstrapConfigSets: [],
          policies: {
            aiServicesOptOut: { attached: [], inherited: [] },
            backup: { attached: [], inherited: [] },
            serviceControl: { attached: [], inherited: [] },
            tag: { attached: [], inherited: [] },
          },
          vars: {},
          accounts: [
            {
              id: identity.accountId,
              status: "active",
              policies: {
                aiServicesOptOut: { attached: [], inherited: [] },
                backup: { attached: [], inherited: [] },
                serviceControl: { attached: [], inherited: [] },
                tag: { attached: [], inherited: [] },
              },
              accountBootstrapRoleName: DEFAULT_ORGANIZATION_ROLE_NAME,
              accountAdminRoleName: DEFAULT_ORGANIZATION_ROLE_NAME,
              configSets: [],
              bootstrapConfigSets: [],
              vars: {},
            },
          ],
        },
      },
    }

    await configRepository.putOrganizationConfig(organizationConfig)

    timer.stop()
    return {
      message: "Success",
      status: "SUCCESS",
      success: true,
      outputFormat: input.outputFormat,
      organization,
      timer,
    }
  } catch (e: any) {
    timer.stop()
    io.error("Failed to create the organization", e)
    return {
      message: e.message,
      status: "FAILED",
      success: false,
      outputFormat: input.outputFormat,
      timer,
    }
  }
}
