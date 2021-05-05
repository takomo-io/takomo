import R from "ramda"
import { ConfigSet, ConfigSetName } from "./model"

export const parseConfigSets = (value: any): ReadonlyArray<ConfigSet> => {
  if (value === null || value === undefined) {
    return []
  }

  return Object.keys(value).map((name) => {
    const { description, vars, commandPaths } = value[name]
    return {
      name,
      description,
      vars: vars ?? {},
      commandPaths: commandPaths ?? [],
      legacy: true,
    }
  })
}

export const mergeConfigSets = (
  configSets: ReadonlyArray<ConfigSet>,
  externalConfigSets: Map<ConfigSetName, ConfigSet>,
): ReadonlyArray<ConfigSet> => {
  const mergedConfigSets = configSets.map((configSet) => {
    const external = externalConfigSets.get(configSet.name)
    if (external) {
      return {
        ...configSet,
        legacy: false,
      }
    }

    return configSet
  })

  const mergedConfigSetNames = mergedConfigSets.map(R.prop("name"))
  const notMergedConfigSets = Array.from(externalConfigSets.values()).filter(
    (e) => !mergedConfigSetNames.includes(e.name),
  )

  return [...mergedConfigSets, ...notMergedConfigSets]
}
