import { grey } from "@takomo/util"

export const printValue = (value: unknown): string =>
  value === null || value === undefined ? grey("<undefined>") : `${value}`
