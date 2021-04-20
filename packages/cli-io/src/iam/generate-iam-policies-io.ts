import {
  GenerateIamPoliciesIO,
  GenerateIamPoliciesOutput,
} from "@takomo/iam-commands"
import { createBaseIO } from "../cli-io"
import { IOProps } from "../stacks/common"

export const createGenerateIamPoliciesIO = (
  props: IOProps,
): GenerateIamPoliciesIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printOutput = (
    output: GenerateIamPoliciesOutput,
  ): GenerateIamPoliciesOutput => {
    output.policies.forEach(({ identity, actions }) => {
      io.subheader({ text: identity, marginTop: true })
      actions.forEach((action) => {
        io.message({ text: ` - ${action}`, indent: 2 })
      })
    })

    return output
  }

  return { ...logger, ...io, printOutput }
}
