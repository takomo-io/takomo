import R from "ramda"
import {
  ConfigSet,
  ConfigSetInstruction,
  ConfigSetName,
  DEFAULT_STAGE_NAME,
} from "../config-sets/config-set-model.js"

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

const parseConfigSetInstruction = (value: unknown): ConfigSetInstruction => {
  if (typeof value === "string") {
    return {
      name: value,
      stage: DEFAULT_STAGE_NAME,
    }
  }

  if (typeof value === "object") {
    const o = value as any
    return {
      name: o.name,
      stage: o.stage ?? DEFAULT_STAGE_NAME,
    }
  }

  throw new Error("Expected config set item to be of type object or string")
}

export const parseConfigSetInstructions = (
  value: unknown,
): ReadonlyArray<ConfigSetInstruction> => {
  if (value === null || value === undefined) {
    return []
  }

  if (typeof value === "string") {
    return [parseConfigSetInstruction(value)]
  }

  if (Array.isArray(value)) {
    return value.map(parseConfigSetInstruction)
  }

  return [parseConfigSetInstruction(value)]
}

export const mergeConfigSetInstructions = (
  inheritedConfigSets: ReadonlyArray<ConfigSetInstruction>,
  configSets: ReadonlyArray<ConfigSetInstruction>,
): ReadonlyArray<ConfigSetInstruction> => {
  if (configSets.length === 0) {
    return inheritedConfigSets.slice()
  }

  const inherited = inheritedConfigSets.reduce((collected, inherited) => {
    const overriding = configSets.find((c) => c.name === inherited.name)
    return overriding ? [...collected, overriding] : [...collected, inherited]
  }, new Array<ConfigSetInstruction>())

  const inheritedNames = inherited.map((i) => i.name)

  const additional = configSets.filter((c) => !inheritedNames.includes(c.name))

  return [...inherited, ...additional]
}
