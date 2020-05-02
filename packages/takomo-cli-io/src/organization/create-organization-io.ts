import { AccountId, Options } from "@takomo/core"
import {
  CreateOrganizationIO,
  CreateOrganizationOutput,
} from "@takomo/organization"
import CliIO from "../cli-io"

export class CliCreateOrganizationIO extends CliIO
  implements CreateOrganizationIO {
  constructor(options: Options) {
    super(options)
  }

  printOutput = (
    output: CreateOrganizationOutput,
  ): CreateOrganizationOutput => {
    const { organization } = output

    if (!organization) {
      return output
    }

    this.header("ORGANIZATION", true)
    this.message(`id:            ${organization.Id}`)
    this.message(`arn:           ${organization.Arn}`)
    this.message(`feature set:   ${organization.FeatureSet}`)

    this.header("MASTER ACCOUNT", true)
    this.message(`id:            ${organization.MasterAccountId}`)
    this.message(`arn:           ${organization.MasterAccountArn}`)
    this.message(`email:         ${organization.MasterAccountEmail}`)

    return output
  }

  confirmOrganizationCreation = async (
    masterAccountId: AccountId,
    featureSet: string,
  ): Promise<boolean> => {
    this.longMessage(
      [
        "Organization information:",
        "",
        `  master account id:   ${masterAccountId}`,
        `  feature set:         ${featureSet}`,
      ],
      true,
    )

    return this.confirm("Continue to create a new organization?", true)
  }
}
