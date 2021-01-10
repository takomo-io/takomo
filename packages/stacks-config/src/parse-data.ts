import { Vars } from "@takomo/core"

export const parseData = (value: unknown): Vars => {
  if (!value) {
    return {}
  }

  return value as Vars
}
