import { ConfigSet, ConfigSetName } from "@takomo/config-sets"
import { ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { arrayToMap, FilePath } from "@takomo/util"
import R from "ramda"
import readdirp from "readdirp"

export const loadConfigSetsFromConfigSetsDir = async (
  configSetsDir: FilePath,
): Promise<Map<ConfigSetName, ConfigSet>> => {
  const dirs = await readdirp.promise(configSetsDir, {
    alwaysStat: true,
    depth: 1,
    type: "directories",
  })

  return arrayToMap(
    dirs.map(R.prop("basename")).map((name) => ({
      name,
      description: "",
      vars: {},
      commandPaths: [ROOT_STACK_GROUP_PATH],
      legacy: false,
    })),
    R.prop("name"),
  )
}
