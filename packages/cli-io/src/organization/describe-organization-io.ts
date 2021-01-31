import {
  DescribeOrganizationIO,
  DescribeOrganizationOutput,
} from "@takomo/organization-commands"
import Table from "easy-table"
import { createBaseIO } from "../cli-io"
import { IOProps } from "../stacks/common"

export const createDescribeOrganizationIO = (
  props: IOProps,
): DescribeOrganizationIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printOutput = (
    output: DescribeOrganizationOutput,
  ): DescribeOrganizationOutput => {
    const { organization, services, enabledPolicies, masterAccount } = output

    const policies =
      enabledPolicies.length === 0 ? "-" : enabledPolicies.join(", ")

    io.header({ text: "ORGANIZATION", marginTop: true })
    io.message({ text: `id:              ${organization.id}` })
    io.message({ text: `arn:             ${organization.arn}` })
    io.message({ text: `feature set:     ${organization.featureSet}` })
    io.message({ text: `policy types:    ${policies}` })

    io.header({ text: "MASTER ACCOUNT", marginTop: true })
    io.message({ text: `id:            ${masterAccount.id}` })
    io.message({ text: `arn:           ${masterAccount.arn}` })
    io.message({ text: `email:         ${masterAccount.email}` })
    io.message({ text: `name:          ${masterAccount.name}` })

    io.header({ text: "TRUSTED ACCESS FOR AWS SERVICES", marginTop: true })

    const servicesTable = new Table()
    services.forEach((sp) => {
      servicesTable.cell("Service", sp.service)
      servicesTable.cell("Enabled", sp.enabled)
      servicesTable.newRow()
    })

    io.message({ text: servicesTable.print() })

    return output
  }

  return {
    ...logger,
    printOutput,
  }
}
