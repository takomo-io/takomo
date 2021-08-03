import { Region } from "@takomo/aws-model"

export const CONFIG_FILE_EXTENSION = ".yml"
export const TEMPLATES_DIR = "templates"
export const STACKS_DIR = "stacks"
export const PARTIALS_DIR = "partials"
export const HELPERS_DIR = "helpers"
export const SCHEMAS_DIR = "schemas"
export const HOOKS_DIR = "hooks"
export const RESOLVERS_DIR = "resolvers"
export const ORGANIZATION_DIR = "organization"
export const DEPLOYMENT_DIR = "deployment"
export const CONFIG_SETS_DIR = "config-sets"
export const DEFAULT_DEPLOYMENT_CONFIG_FILE = "targets.yml"
export const DEFAULT_ORGANIZATION_CONFIG_FILE = "organization.yml"
export const STACK_GROUP_CONFIG_FILE_NAME = "config.yml"
export const TAKOMO_PROJECT_CONFIG_FILE_NAME = "takomo.yml"

export const DEFAULT_REGIONS: ReadonlyArray<Region> = [
  "af-south-1",
  "ap-east-1",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-northeast-3",
  "ap-south-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ca-central-1",
  "cn-north-1",
  "cn-northwest-1",
  "eu-central-1",
  "eu-north-1",
  "eu-south-1",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "me-south-1",
  "sa-east-1",
  "us-east-1",
  "us-east-2",
  "us-gov-east-1",
  "us-west-1",
  "us-west-2",
]

export const OUTPUT_OPT = "output"
export const INTERACTIVE_OPT = "interactive"
export const INTERACTIVE_ALIAS_OPT = "i"
export const IGNORE_DEPENDENCIES_OPT = "ignore-dependencies"
export const FEATURE_SET_OPT = "feature-set"
export const ACCOUNT_ID_OPT = "account-id"
export const ACCOUNT_ID_ALIAS_OPT = "a"
export const COMMAND_PATH_OPT = "command-path"
export const CONCURRENT_TARGETS_OPT = "concurrent-targets"
export const TARGET_OPT = "target"
export const EXCLUDE_TARGET_OPT = "exclude-target"
export const LABEL_OPT = "label"
export const EXCLUDE_LABEL_OPT = "exclude-label"
export const CONCURRENT_ACCOUNTS_OPT = "concurrent-accounts"
export const ORGANIZATIONAL_UNITS_OPT = "organizational-units"
export const ROLE_NAME_OPT = "role-name"
export const ALIAS_OPT = "alias"
export const CONFIG_FILE_OPT = "config-file"
export const CONFIG_SET_OPT = "config-set"
