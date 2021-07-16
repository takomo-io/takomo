import { ConfigSetInstruction } from "@takomo/config-sets"

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
