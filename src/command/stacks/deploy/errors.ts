import { InternalStack } from "../../../stacks/stack"
import { TakomoError } from "../../../utils/errors"

export class IncompatibleIgnoreDependenciesOptionOnLaunchError extends TakomoError {
  constructor(stacks: ReadonlyArray<InternalStack>) {
    const stackPaths = stacks.map((s) => `  - ${s.path}`).join("\n")

    super(
      "Incompatible option --ignore-dependencies. Expected exactly " +
        `one stack to be deployed but got ${stacks.length}.\n\nStacks selected for deploy:\n${stackPaths}`,
      {
        info: "Using --ignore-dependencies option is allowed only when exactly one stack is deployed.",
        instructions: [
          "Provide more specific command path that points to exactly one stack, e.g. use the full stack path.",
        ],
      },
    )
  }
}
