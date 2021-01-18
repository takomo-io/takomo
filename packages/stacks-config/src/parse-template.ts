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

  return {
    filename: value.filename,
    dynamic: value.dynamic ?? true,
  }
}
