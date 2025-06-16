import { readdirpPromise } from "readdirp"
import { ConfigSet, ConfigSetName } from "../../config-sets/config-set-model.js"
import { ROOT_STACK_GROUP_PATH } from "../../takomo-stacks-model/constants.js"
import { arrayToMap } from "../../utils/collections.js"
import { FilePath } from "../../utils/files.js"

export const loadConfigSetsFromConfigSetsDir = async (
  configSetsDir: FilePath,
): Promise<Map<ConfigSetName, ConfigSet>> => {
  const dirs = await readdirpPromise(configSetsDir, {
    alwaysStat: true,
    depth: 1,
    type: "directories",
  })

  return arrayToMap(
    dirs
      .map((d) => d.basename)
      .map((name) => ({
        name,
        description: "",
        vars: {},
        commandPaths: [ROOT_STACK_GROUP_PATH],
        legacy: false,
      })),
    (f) => f.name,
  )
}
