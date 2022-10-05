import {
  ConfigSetInstruction,
  ConfigSetInstructionsHolder,
  ConfigSetType,
} from "./model"

export const getConfigSetsByType = (
  configSetType: ConfigSetType,
  holder: ConfigSetInstructionsHolder,
): ReadonlyArray<ConfigSetInstruction> => {
  switch (configSetType) {
    case "bootstrap":
      return holder.bootstrapConfigSets
    case "standard":
      return holder.configSets
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
}
