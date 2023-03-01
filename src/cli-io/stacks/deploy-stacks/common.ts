import { grey } from "../../../utils/colors.js"

export const printValue = (value: unknown): string =>
  value === null || value === undefined ? grey("<undefined>") : `${value}`
