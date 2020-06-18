import { Options } from "@takomo/core"
import path from "path"
import { ConfigSet } from "./model"

export const buildOptionsForConfigSet = (
  currentOptions: Options,
  configSet: ConfigSet,
): Options => {
  const configSetProjectDir = configSet.projectDir

  if (configSetProjectDir === null) {
    return currentOptions
  }

  const props = currentOptions.toProps()

  if (
    configSetProjectDir.startsWith("/") ||
    configSetProjectDir.startsWith("~")
  ) {
    return new Options({
      ...props,
      projectDir: configSetProjectDir,
    })
  }

  return new Options({
    ...props,
    projectDir: path.join(currentOptions.getProjectDir(), configSetProjectDir),
  })
}
