import { FilePath, TakomoError } from "@takomo/util"

export class InvalidAccountFileLocationError extends TakomoError {
  constructor(pathToFile: FilePath, baseDir: FilePath) {
    super(`Account file ${pathToFile} must not be directly in ${baseDir} dir`, {
      instructions: [
        `Create a subdirectory under ${baseDir} and move the account file there`,
      ],
      info:
        "When 'inferOUPathFromDirName' property is set to true, " +
        "account files can't be placed directory into the dir specified " +
        "with the 'dir' property",
    })
  }
}
