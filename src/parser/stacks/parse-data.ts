import { Vars } from "../../common/model.js"

export const parseData = (value: unknown): Vars => {
  if (!value) {
    return {}
  }

  return value as Vars
}
