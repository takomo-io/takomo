import { TimeoutConfig } from "@takomo/stacks-model"

export const parseTimeout = (value: any): TimeoutConfig | null => {
  if (!value) {
    return null
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
