import {
  IGNORE_DEPENDENCIES_OPT,
  INTERACTIVE_ALIAS_OPT,
  INTERACTIVE_OPT,
  outputFormatOptions,
} from "../constants"

export const interactiveCommandPathSelectionOptions = {
  [INTERACTIVE_OPT]: {
    alias: INTERACTIVE_ALIAS_OPT,
    description: "Interactive selecting of the command path",
    boolean: true,
    global: false,
    default: false,
    demandOption: false,
  },
}

export const stackOperationOptions = {
  ...interactiveCommandPathSelectionOptions,
  ...outputFormatOptions,
  [IGNORE_DEPENDENCIES_OPT]: {
    description: "Ignore stack dependencies",
    boolean: true,
    global: false,
    default: false,
    demandOption: false,
  },
}
