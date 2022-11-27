import { InternalStack } from "../../../stacks/stack"
import { DetailedCloudFormationStack } from "../../../takomo-aws-model"
import { bold, green, grey, red } from "../../../utils/colors"
import { BaseIO } from "../../cli-io"

export const printTerminationProtection = (
  io: BaseIO,
  stack: InternalStack,
  existingStack?: DetailedCloudFormationStack,
): void => {
  const formatCurrent = (enabled?: boolean): string => {
    if (enabled === undefined) {
      return grey("<undefined>")
    }

    return enabled ? "enabled" : "disabled"
  }

  const formatNew = (enabled: boolean): string =>
    enabled ? green("enabled") : red("disabled")

  if (
    !existingStack ||
    existingStack.enableTerminationProtection !== stack.terminationProtection
  ) {
    const currentValue = formatCurrent(
      existingStack?.enableTerminationProtection,
    )
    const newValue = formatNew(stack.terminationProtection)

    io.message({
      text: bold("Termination protection:"),
      marginTop: true,
      marginBottom: true,
    })
    io.message({
      text: `  current value:                 ${currentValue}`,
    })
    io.message({
      text: `  new value:                     ${newValue}`,
    })
  }
}
