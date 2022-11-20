import { grey } from "../../../utils/colors"

export const printValue = (value: unknown): string =>
  value === null || value === undefined ? grey("<undefined>") : `${value}`
