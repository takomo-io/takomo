import R from "ramda"

import {
  GenerateIamPoliciesIO,
  GenerateIamPoliciesOutput,
} from "../../command/iam/model"
import { formatYaml } from "../../utils/yaml"
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
    io.header({ text: "Policy generation results", marginTop: true })

    if (output.policies.length === 0) {
      io.message({
        text: "No events found with the given inputs",
        marginTop: true,
      })
    } else {
      io.longMessage(
        [
          "The policies were generated based on the events available in CloudTrail.",
          "Please note that some actions in the generated policies may not be valid because",
          "not all events logged in CloudTrail can be directly mapped to IAM actions.",
          "",
          "You can use these policies as a starting point for your own handcrafted and",
          "fine-tuned policies.",
        ],
        false,
        false,
        0,
      )
    }

    output.policies.forEach(({ identity, actions }) => {
      io.subheader({ text: identity, marginTop: true })

      const actionsByService = R.groupBy((a) => a.split(":")[0], actions)
      const statements = Object.entries(actionsByService).map(
        ([service, serviceActions]) => ({
          Sid: service,
          Effect: "Allow",
          Action: serviceActions,
          Resource: "*",
        }),
      )

      const policy = {
        Version: "2012-10-17",
        Statement: statements,
      }

      const formattedPolicy = formatYaml(policy)
      io.longMessage(formattedPolicy.split("\n"), true, false, 2)
    })

    return output
  }

  return { ...logger, ...io, printOutput }
}
