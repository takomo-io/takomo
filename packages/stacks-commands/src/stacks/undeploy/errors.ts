import { InternalStack } from "@takomo/stacks-model"
import { TakomoError } from "@takomo/util"

export class IncompatibleIgnoreDependenciesOptionOnDeleteError extends TakomoError {
  constructor(stacks: ReadonlyArray<InternalStack>) {
    const stacksPaths = stacks.map((s) => `  - ${s.path}`).join("\n")

    super(
      "Incompatible option --ignore-dependencies. Expected exactly " +
        `one stack to be undeployed but got ${stacks.length}.\n\nStacks selected for undeploy:\n${stacksPaths}`,
      {
        info: "Using --ignore-dependencies option is allowed only when exactly one stack is undeployed.",
        instructions: [
          "Provide more specific command path that points to exactly one stack, e.g. use the full stack path.",
        ],
      },
    )
  }
}
