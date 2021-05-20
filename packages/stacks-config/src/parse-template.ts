import { TemplateConfig } from "./model"

export const parseTemplate = (value: any): TemplateConfig => {
  if (value === null || value === undefined) {
    return {
      dynamic: true,
    }
  }

  if (typeof value === "string") {
    return {
      filename: value,
      dynamic: true,
    }
  }

  if (value.filename) {
    return {
      filename: value.filename,
      dynamic: value.dynamic ?? true,
    }
  }

  if (value.inline) {
    return {
      inline: value.inline,
      dynamic: value.dynamic ?? true,
    }
  }

  throw new Error("Invalid template configuration")
}
