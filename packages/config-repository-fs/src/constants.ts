import { FilePath } from "@takomo/util"
import path from "path"

export const CONFIG_FILE_EXTENSION = ".yml"
export const TEMPLATES_DIR = "templates"
export const STACKS_DIR = "stacks"
export const PARTIALS_DIR = "partials"
export const HELPERS_DIR = "helpers"
export const BLUEPRINTS_DIR = "blueprints"
export const SCHEMAS_DIR = "schemas"
export const HOOKS_DIR = "hooks"
export const RESOLVERS_DIR = "resolvers"
export const DEPLOYMENT_DIR = "deployment"
export const CONFIG_SETS_DIR = "config-sets"
export const DEFAULT_DEPLOYMENT_CONFIG_FILE = "targets.yml"
export const STACK_GROUP_CONFIG_FILE_NAME = "config.yml"
export const TAKOMO_PROJECT_CONFIG_FILE_NAME = "takomo.yml"
export const CACHE_DIR = ".takomo-cache"

export interface ProjectFilePaths {
  readonly projectDir: FilePath
  readonly stacksDir: FilePath
  readonly templatesDir: FilePath
  readonly partialsDir: FilePath
  readonly hooksDir: FilePath
  readonly resolversDir: FilePath
  readonly helpersDir: FilePath
  readonly blueprintsDir: FilePath
  readonly schemasDir: FilePath
  readonly projectConfigFile: FilePath
  readonly stackGroupConfigFileName: string
  readonly projectConfigFileName: string
  readonly configFileExtension: string
  readonly defaultDeploymentConfigFileName: string
  readonly deploymentDir: FilePath
  readonly configSetsDir: FilePath
  readonly cacheDir: FilePath
}

export const createProjectFilePaths = (
  projectDir: FilePath,
): ProjectFilePaths => ({
  projectDir,
  hooksDir: path.join(projectDir, HOOKS_DIR),
  helpersDir: path.join(projectDir, HELPERS_DIR),
  partialsDir: path.join(projectDir, PARTIALS_DIR),
  resolversDir: path.join(projectDir, RESOLVERS_DIR),
  stacksDir: path.join(projectDir, STACKS_DIR),
  templatesDir: path.join(projectDir, TEMPLATES_DIR),
  schemasDir: path.join(projectDir, SCHEMAS_DIR),
  blueprintsDir: path.join(projectDir, BLUEPRINTS_DIR),
  projectConfigFile: path.join(projectDir, TAKOMO_PROJECT_CONFIG_FILE_NAME),
  projectConfigFileName: TAKOMO_PROJECT_CONFIG_FILE_NAME,
  stackGroupConfigFileName: STACK_GROUP_CONFIG_FILE_NAME,
  configFileExtension: CONFIG_FILE_EXTENSION,
  defaultDeploymentConfigFileName: DEFAULT_DEPLOYMENT_CONFIG_FILE,
  deploymentDir: path.join(projectDir, DEPLOYMENT_DIR),
  configSetsDir: path.join(projectDir, CONFIG_SETS_DIR),
  cacheDir: path.join(projectDir, CACHE_DIR),
})
