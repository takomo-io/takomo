import { Stack } from "@takomo/stacks-model"
import { TakomoError } from "@takomo/util"

export class IncompatibleIgnoreDependenciesOptionOnLaunchError extends TakomoError {
  constructor(stacksToLaunch: Stack[]) {
    const stacksPathsToLaunch = stacksToLaunch
      .map((s) => `  - ${s.getPath()}`)
      .join("\n")

    super(
      "Incompatible option --ignore-dependencies. Expected exactly " +
        `one stack to be launched but got ${stacksToLaunch.length}.\n\nStacks selected for launch:\n${stacksPathsToLaunch}`,
      {
        info:
          "Using --ignore-dependencies option is allowed only when exactly one stack is launched.",
        instructions: [
          "Provide more specific command path that points to exactly one stack, e.g. use the full stack path.",
        ],
      },
    )
  }
}
