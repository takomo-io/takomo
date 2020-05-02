import { CommandPath } from "@takomo/core"
import { TakomoError } from "@takomo/util"
import { Stack } from "./model"

export class CommandPathMatchesNoStacksError extends TakomoError {
  constructor(commandPath: CommandPath, availableStacks: Stack[]) {
    const stackPaths = availableStacks
      .map((s) => `  - ${s.getPath()}`)
      .join("\n")

    super(
      `No stacks found within the given command path: ${commandPath}\n\nAvailable stack paths:\n\n${stackPaths}`,
    )
  }
}
