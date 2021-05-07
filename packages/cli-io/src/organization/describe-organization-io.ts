import {
  DescribeOrganizationIO,
  DescribeOrganizationOutput,
} from "@takomo/organization-commands"
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
    const { organization, enabledPolicies, masterAccount } = output

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

    return output
  }

  return {
    ...logger,
    printOutput,
  }
}
