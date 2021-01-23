import { AccountId } from "@takomo/aws-model"
import {
  CreateOrganizationIO,
  CreateOrganizationOutput,
} from "@takomo/organization-commands"
import { createBaseIO } from "../cli-io"
import { IOProps } from "../stacks/common"

export const createCreateOrganizationIO = (
  props: IOProps,
): CreateOrganizationIO => {
  const { logger } = props
  const io = createBaseIO(props)
  const printOutput = (
    output: CreateOrganizationOutput,
  ): CreateOrganizationOutput => {
    const { organization } = output

    if (!organization) {
      return output
    }

    io.header({ text: "Organization", marginTop: true })
    io.message({ text: `id:            ${organization.id}` })
    io.message({ text: `arn:           ${organization.arn}` })
    io.message({ text: `feature set:   ${organization.featureSet}` })

    io.header({ text: "Master account", marginTop: true })
    io.message({ text: `id:            ${organization.masterAccountId}` })
    io.message({ text: `arn:           ${organization.masterAccountArn}` })
    io.message({ text: `email:         ${organization.masterAccountEmail}` })

    return output
  }

  const confirmOrganizationCreation = async (
    masterAccountId: AccountId,
    featureSet: string,
  ): Promise<boolean> => {
    io.subheader({
      text: "Review new organization information",
      marginTop: true,
    })
    io.longMessage(
      [
        "A new organization will be created with following information:",
        "",
        `  master account id:   ${masterAccountId}`,
        `  feature set:         ${featureSet}`,
      ],
      false,
      false,
      0,
    )

    return io.confirm("Continue to create a new organization?", true)
  }

  return {
    ...logger,
    confirmOrganizationCreation,
    printOutput,
  }
}
