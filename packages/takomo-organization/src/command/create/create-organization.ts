import { OrganizationsClient } from "@takomo/aws-clients"
import { CommandStatus, initDefaultCredentialProvider } from "@takomo/core"
import { StopWatch } from "@takomo/util"
import {
  CreateOrganizationInput,
  CreateOrganizationIO,
  CreateOrganizationOutput,
} from "./model"

export const createOrganization = async (
  input: CreateOrganizationInput,
  io: CreateOrganizationIO,
): Promise<CreateOrganizationOutput> => {
  const watch = new StopWatch("total")
  const { options, featureSet } = input

  const credentialProvider = await initDefaultCredentialProvider()
  const identity = await credentialProvider.getCallerIdentity()

  if (
    !options.isAutoConfirmEnabled() &&
    !(await io.confirmOrganizationCreation(identity.accountId, featureSet))
  ) {
    return {
      message: "Cancelled",
      status: CommandStatus.CANCELLED,
      success: true,
      organization: null,
      watch: watch.stop(),
    }
  }

  const client = new OrganizationsClient({
    logger: io,
    credentialProvider: credentialProvider,
    region: "us-east-1",
  })

  try {
    const organization = await client.createOrganization(featureSet)

    return {
      message: "Success",
      status: CommandStatus.SUCCESS,
      success: true,
      organization,
      watch: watch.stop(),
    }
  } catch (e) {
    io.error("Failed to create the organization", e)
    return {
      message: e.message,
      status: CommandStatus.FAILED,
      success: false,
      organization: null,
      watch: watch.stop(),
    }
  }
}
