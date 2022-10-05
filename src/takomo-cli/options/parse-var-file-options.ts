import { VarFileOption } from "../../takomo-util"

export const parseVarFileOptions = (
  varFileArgs: any,
): ReadonlyArray<VarFileOption> => {
  const varFileArray = varFileArgs
    ? Array.isArray(varFileArgs)
      ? varFileArgs
      : [varFileArgs]
    : []

  return varFileArray.reduce((collected, current) => {
    if (/^([a-zA-Z][a-zA-Z0-9_]+)=/.test(current)) {
      const [variableName, filePath] = current.split("=", 2)
      return [...collected, { filePath, variableName }]
    } else {
      return [...collected, { filePath: current }]
    }
  }, new Array<VarFileOption>())
}
