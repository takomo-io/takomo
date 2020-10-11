import { Options } from "@takomo/core"
import {
  DependencyGraphIO,
  DependencyGraphOutput,
} from "@takomo/stacks-commands"
import { LogWriter } from "@takomo/util"
import CliIO from "../../cli-io"

export class CliDependencyGraphIO extends CliIO implements DependencyGraphIO {
  constructor(options: Options, logWriter: LogWriter = console.log) {
    super(logWriter, options)
  }

  printOutput = (output: DependencyGraphOutput): DependencyGraphOutput => {
    this.message("digraph dependencies {", true)
    output.stacks.forEach((stack) => {
      if (stack.getDependencies().length === 0) {
        this.message(`  "${stack.getPath()}"`)
      } else {
        stack.getDependencies().forEach((dependency) => {
          this.message(`  "${stack.getPath()}" -> "${dependency}"`)
        })
      }
    })

    this.print("}")

    return output
  }
}
