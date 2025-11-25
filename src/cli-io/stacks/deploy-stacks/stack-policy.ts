import {
  ALLOW_ALL_STACK_POLICY,
  DetailedCloudFormationStack,
  StackPolicyBody,
} from "../../../aws/cloudformation/model.js"
import { InternalStandardStack } from "../../../stacks/standard-stack.js"
import { bold, green } from "../../../utils/colors.js"
import { prettyPrintJson } from "../../../utils/json.js"
import { diffStrings } from "../../../utils/strings.js"
import { BaseIO } from "../../cli-io.js"

const ensureContentsEndsWithLineFeed = (content: string): string =>
  content.endsWith("\n") ? content : content + "\n"

type PolicyOperationType = "create" | "delete" | "update" | "retain"

export const resolvePolicyOperation = (
  current: StackPolicyBody | undefined,
  updated: StackPolicyBody | undefined,
): PolicyOperationType => {
  if (!current && updated) {
    return "create"
  }

  if (current && !updated) {
    const currentReformatted = prettyPrintJson(current)
    const allowAllReformatted = prettyPrintJson(ALLOW_ALL_STACK_POLICY)

    // CloudFormation doesn't support removing of stack policy once it has been created.
    // As a workaround, when a stack policy is removed from the stack configuration, we
    // update the policy with the allow all policy. Next time the stack is updated we need
    // to check if this workaround has already been performed earlier.
    if (currentReformatted === allowAllReformatted) {
      return "retain"
    }

    return "delete"
  }

  const currentFormatted = current ? prettyPrintJson(current) : ""
  const updatedFormatted = updated ? prettyPrintJson(updated) : ""

  if (currentFormatted === updatedFormatted) {
    return "retain"
  }

  return "update"
}

export const printStackPolicy = (
  io: BaseIO,
  stack: InternalStandardStack,
  existingStack?: DetailedCloudFormationStack,
): void => {
  const type = resolvePolicyOperation(
    existingStack?.stackPolicyBody,
    stack.stackPolicy,
  )

  if (type === "retain") {
    return
  }

  io.message({
    text: bold("Stack policy:"),
    marginTop: true,
    marginBottom: true,
  })

  switch (type) {
    case "create":
      io.message({
        text: "Stack policy will be created",
        indent: 2,
        marginBottom: true,
      })
      io.message({
        text: prettyPrintJson(stack.stackPolicy!),
        transform: (str) =>
          green(
            str
              .split("\n")
              .map((s) => `  + ${s}`)
              .join("\n"),
          ),
      })
      break
    case "delete":
      io.longMessage(
        [
          "Stack policy will be replaced with allow all policy.",
          "",
          "You have removed the stack policy from the stack configuration file,",
          "but CloudFormation doesn't support removing the stack policy from stacks.",
          "As a workaround, the stack policy will be replaced with allow all policy,",
          "which is essentially equivalent to not having a stack policy attached at all.",
        ],
        false,
        true,
        2,
      )

      io.message({
        text: diffStrings(
          ensureContentsEndsWithLineFeed(
            prettyPrintJson(existingStack!.stackPolicyBody!),
          ),
          ensureContentsEndsWithLineFeed(
            prettyPrintJson(ALLOW_ALL_STACK_POLICY),
          ),
        ),
        indent: 2,
      })
      break
    case "update":
      io.message({
        text: "Stack policy will be updated",
        indent: 2,
        marginBottom: true,
      })
      const current = ensureContentsEndsWithLineFeed(
        prettyPrintJson(existingStack!.stackPolicyBody!),
      )
      const updated = ensureContentsEndsWithLineFeed(
        prettyPrintJson(stack.stackPolicy!),
      )
      const diffOutput = diffStrings(current, updated)
      io.message({ text: diffOutput, indent: 2 })
      break
    default:
      throw new Error(`Unsupported stack policy operation: ${type}`)
  }
}
