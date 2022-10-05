import { TimeoutConfig } from "../takomo-stacks-model"

export const parseTimeout = (value: any): TimeoutConfig | undefined => {
  if (!value) {
    return undefined
  }

  if (typeof value === "number") {
    return {
      create: value,
      update: value,
    }
  }

  return {
    create: value.create,
    update: value.update,
  }
}
