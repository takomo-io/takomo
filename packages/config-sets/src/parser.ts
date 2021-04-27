import { ConfigSet } from "./model"

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
