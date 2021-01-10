import {
  DependencyGraphIO,
  DependencyGraphOutput,
} from "@takomo/stacks-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import { createBaseIO } from "../../cli-io"

export const createDependencyGraphIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): DependencyGraphIO => {
  const io = createBaseIO(writer)
  const indent = 2

  const printOutput = (
    output: DependencyGraphOutput,
  ): DependencyGraphOutput => {
    io.message({ text: "digraph dependencies {", marginTop: true })
    output.stacks.forEach((stack) => {
      if (stack.dependencies.length === 0) {
        io.message({ text: `"${stack.path}"`, indent })
      } else {
        stack.dependencies.forEach((dependency) => {
          io.message({ text: `"${stack.path}" -> "${dependency}"`, indent })
        })
      }
    })

    io.print("}")

    return output
  }

  return {
    ...logger,
    printOutput,
  }
}
