import {
  Constants,
  initDefaultCredentialProvider,
  IO,
  Options,
  Variables,
} from "@takomo/core"
import {
  dirExists,
  fileExists,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import path from "path"
import { parseDeploymentConfigFile } from "../config"
import { DeploymentTargetsContext } from "../model"

export const buildDeploymentTargetsContext = async (
  options: Options,
  variables: Variables,
  configFileName: string | null,
  io: IO,
): Promise<DeploymentTargetsContext> => {
  const credentialProvider = await initDefaultCredentialProvider()

  const projectDir = options.getProjectDir()
  io.debug(`Current project dir: ${projectDir}`)

  const deploymentGroupsDirPath = path.join(
    projectDir,
    Constants.DEPLOYMENT_DIR,
  )
  if (!(await dirExists(deploymentGroupsDirPath))) {
    throw new TakomoError(
      `Takomo deployment dir '${Constants.DEPLOYMENT_DIR}' not found from the project dir ${projectDir}`,
    )
  }

  const deploymentGroupFile = configFileName || Constants.DEPLOYMENT_CONFIG_FILE

  const pathToDeploymentGroupsConfigFile = path.join(
    deploymentGroupsDirPath,
    deploymentGroupFile,
  )
  if (!(await fileExists(pathToDeploymentGroupsConfigFile))) {
    throw new TakomoError(
      `Takomo deployment configuration file '${deploymentGroupFile}' not found from the deployment dir ${deploymentGroupsDirPath}`,
    )
  }

  const templateEngine = new TemplateEngine()

  const configFile = await parseDeploymentConfigFile(
    io,
    options,
    variables,
    pathToDeploymentGroupsConfigFile,
    templateEngine,
  )

  return new DeploymentTargetsContext({
    configFile,
    credentialProvider: credentialProvider,
    options,
    variables,
    logger: io,
  })
}
