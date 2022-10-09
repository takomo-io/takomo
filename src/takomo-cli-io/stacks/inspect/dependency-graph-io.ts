import {
  DependencyGraphIO,
  DependencyGraphOutput,
} from "../../../takomo-stacks-commands"
import { createBaseIO } from "../../cli-io"
import { IOProps } from "../common"

export const createDependencyGraphIO = (props: IOProps): DependencyGraphIO => {
  const { logger } = props
  const io = createBaseIO(props)
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
