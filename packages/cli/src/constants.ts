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
