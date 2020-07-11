export const TAKOMO_REQUIRED_NODEJS_VERSION = ">=14.4.0"
export const CONFIG_FILE_EXTENSION = ".yml"
export const TEMPLATES_DIR = "templates"
export const STACKS_DIR = "stacks"
export const PARTIALS_DIR = "partials"
export const HELPERS_DIR = "helpers"
export const HOOKS_DIR = "hooks"
export const RESOLVERS_DIR = "resolvers"
export const ORGANIZATION_DIR = "organization"
export const DEPLOYMENT_DIR = "deployment"
export const DEPLOYMENT_CONFIG_FILE = "targets.yml"
export const STACK_GROUP_CONFIG_FILE = "config.yml"
export const ORGANIZATION_CONFIG_FILE = "organization.yml"
export const ROOT_STACK_GROUP_PATH = "/"
export const DEFAULT_ORGANIZATION_ROLE_NAME = "OrganizationAccountAccessRole"
export const TAKOMO_PROJECT_CONFIG_FILE = "takomo.yml"
export const SERVICE_CONTROL_POLICY_MAX_SIZE_IN_BYTES = 5120
export const TAG_POLICY_MAX_SIZE_IN_CHARACTERS = 2500

export const REGIONS = [
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

export const ORGANIZATION_SERVICE_PRINCIPALS = [
  "aws-artifact-account-sync.amazonaws.com",
  "cloudtrail.amazonaws.com",
  "compute-optimizer.amazonaws.com",
  "config.amazonaws.com",
  "ds.amazonaws.com",
  "fms.amazonaws.com",
  "license-manager.amazonaws.com",
  "member.org.stacksets.cloudformation.amazonaws.com",
  "ram.amazonaws.com",
  "servicecatalog.amazonaws.com",
  "ssm.amazonaws.com",
  "sso.amazonaws.com",
  "tagpolicies.tag.amazonaws.com",
]

export const SERVICE_CONTROL_POLICY_TYPE = "SERVICE_CONTROL_POLICY"
export const TAG_POLICY_TYPE = "TAG_POLICY"
export const AISERVICES_OPT_OUT_POLICY_TYPE = "AISERVICES_OPT_OUT_POLICY"
export const BACKUP_POLICY_TYPE = "BACKUP_POLICY"

export const ORGANIZATION_POLICY_TYPES = [
  SERVICE_CONTROL_POLICY_TYPE,
  TAG_POLICY_TYPE,
  AISERVICES_OPT_OUT_POLICY_TYPE,
  BACKUP_POLICY_TYPE,
]

export const DEFAULT_SERVICE_CONTROL_POLICY_NAME = "FullAWSAccess"
export const DEFAULT_SERVICE_CONTROL_POLICY_ID = "p-FullAWSAccess"
