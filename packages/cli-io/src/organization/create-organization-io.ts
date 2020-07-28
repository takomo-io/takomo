import { AccountId, Options } from "@takomo/core"
import {
  CreateOrganizationIO,
  CreateOrganizationOutput,
} from "@takomo/organization-commands"
import CliIO from "../cli-io"

export class CliCreateOrganizationIO extends CliIO
  implements CreateOrganizationIO {
  constructor(options: Options) {
    super(options)
  }

  printOutput = (
    output: CreateOrganizationOutput,
  ): CreateOrganizationOutput => {
    const { organization, configurationFile } = output

    if (!organization) {
      return output
    }

    this.header("Organization", true)
    this.message(`id:            ${organization.Id}`)
    this.message(`arn:           ${organization.Arn}`)
    this.message(`feature set:   ${organization.FeatureSet}`)

    this.header("Master account", true)
    this.message(`id:            ${organization.MasterAccountId}`)
    this.message(`arn:           ${organization.MasterAccountArn}`)
    this.message(`email:         ${organization.MasterAccountEmail}`)

    if (configurationFile) {
      this.message(
        `Organization configuration file was created in path: ${configurationFile}`,
        true,
      )
    }

    return output
  }

  confirmOrganizationCreation = async (
    masterAccountId: AccountId,
    featureSet: string,
  ): Promise<boolean> => {
    this.subheader("Review new organization information", true)
    this.longMessage([
      "A new organization will be created with following information:",
      "",
      `  master account id:   ${masterAccountId}`,
      `  feature set:         ${featureSet}`,
    ])

    return this.confirm("Continue to create a new organization?", true)
  }
}
