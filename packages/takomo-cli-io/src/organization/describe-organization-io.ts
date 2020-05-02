import { Constants, Options } from "@takomo/core"
import {
  DescribeOrganizationIO,
  DescribeOrganizationOutput,
} from "@takomo/organization"
import Table from "easy-table"
import CliIO from "../cli-io"

export class CliDescribeOrganizationIO extends CliIO
  implements DescribeOrganizationIO {
  constructor(options: Options) {
    super(options)
  }

  printOutput = (
    output: DescribeOrganizationOutput,
  ): DescribeOrganizationOutput => {
    const { organization, services, enabledPolicies, masterAccount } = output

    const policies =
      enabledPolicies.length === 0 ? "-" : enabledPolicies.join(", ")

    this.header("ORGANIZATION", true)
    this.message(`id:              ${organization.Id}`)
    this.message(`arn:             ${organization.Arn}`)
    this.message(`feature set:     ${organization.FeatureSet}`)
    this.message(`policy types:    ${policies}`)

    this.header("MASTER ACCOUNT", true)
    this.message(`id:            ${masterAccount.Id}`)
    this.message(`arn:           ${masterAccount.Arn}`)
    this.message(`email:         ${masterAccount.Email}`)
    this.message(`name:          ${masterAccount.Name}`)

    this.header("TRUSTED ACCESS FOR AWS SERVICES", true)

    const servicesTable = new Table()
    Constants.ORGANIZATION_SERVICE_PRINCIPALS.forEach(sp => {
      const enabled =
        services.find(s => s.ServicePrincipal === sp) !== undefined

      servicesTable.cell("Service", sp)
      servicesTable.cell("Enabled", enabled)
      servicesTable.newRow()
    })

    this.message(servicesTable.print())

    return output
  }
}
