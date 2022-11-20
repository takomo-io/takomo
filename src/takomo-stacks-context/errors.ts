import { StackPath } from "../takomo-stacks-model"
import { TakomoError } from "../utils/errors"

interface Reference {
  readonly from: StackPath
  readonly to: ReadonlyArray<StackPath>
}

export class ObsoleteDependenciesError extends TakomoError {
  constructor(references: ReadonlyArray<Reference>) {
    const message =
      `Dependencies to obsolete stacks detected.\n\nThe following ${references.length} stack(s) depend on stacks marked as obsolete:\n\n` +
      references.map(
        ({ from, to }) =>
          `  ${from}:\n${to
            .slice()
            .sort()
            .map((t) => `    - ${t} (marked as obsolete)\n`)
            .join("")}`,
      )

    super(message, {
      info: "Stacks can't have dependencies on stacks marked as obsolete.",
      instructions: ["Remove dependencies to obsolete stacks."],
    })
  }
}
