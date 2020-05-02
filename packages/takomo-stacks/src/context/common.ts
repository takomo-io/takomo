import { CommandPath } from "@takomo/core"

export const isStackGroupPath = (commandPath: CommandPath): boolean =>
  !commandPath.includes(".yml")
