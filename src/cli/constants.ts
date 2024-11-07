export const OUTPUT_OPT = "output"
export const INTERACTIVE_OPT = "interactive"
export const EXPECT_NO_CHANGES_OPT = "expect-no-changes"
export const INTERACTIVE_ALIAS_OPT = "i"
export const IGNORE_DEPENDENCIES_OPT = "ignore-dependencies"
export const COMMAND_PATH_OPT = "command-path"
export const CONCURRENT_TARGETS_OPT = "concurrent-targets"
export const TARGET_OPT = "target"
export const EXCLUDE_TARGET_OPT = "exclude-target"
export const LABEL_OPT = "label"
export const EXCLUDE_LABEL_OPT = "exclude-label"
export const ROLE_NAME_OPT = "role-name"
export const CONFIG_FILE_OPT = "config-file"
export const CONFIG_SET_OPT = "config-set"
export const RESET_CACHE_OPT = "reset-cache"
export const OUT_DIR_OPT = "out-dir"
export const SKIP_PARAMETERS_OPT = "skip-parameters"
export const SKIP_HOOKS_OPT = "skip-hooks"

export const outputFormatOptions = {
  [OUTPUT_OPT]: {
    description: "Output format",
    choices: ["text", "json", "yaml"],
    default: "text",
    string: true,
    global: false,
    demandOption: false,
  },
}

export const outputDirOptions = {
  [OUT_DIR_OPT]: {
    description: "Emit output files to this dir",
    string: true,
    default: undefined,
    global: false,
    demandOption: false,
  },
}

export const skipHooksOptions = {
  [SKIP_HOOKS_OPT]: {
    description: "Skip executing hooks",
    boolean: true,
    default: false,
    global: false,
    demandOption: false,
  },
}

export const skipParametersOptions = {
  [SKIP_PARAMETERS_OPT]: {
    description: "Skip parameters and executing resolvers",
    boolean: true,
    default: false,
    global: false,
    demandOption: false,
  },
}
