import { TakomoError } from "../utils/errors"
import { FilePath } from "../utils/files"

export class InvalidDeploymentTargetFileLocationError extends TakomoError {
  constructor(pathToFile: FilePath, baseDir: FilePath) {
    super(
      `Deployment target file ${pathToFile} must not be directly in ${baseDir} dir`,
      {
        instructions: [
          `Create a subdirectory under ${baseDir} and move the deployment target file there`,
        ],
        info:
          "When 'inferDeploymentGroupPathFromDirName' property is set to true, " +
          "deployment target files can't be placed directory into the dir specified " +
          "with the 'dir' property",
      },
    )
  }
}
