import { TemplateConfig } from "./model"

export const parseTemplate = (value: any): TemplateConfig => {
  if (value === null || value === undefined) {
    return {
      filename: undefined,
      inline: undefined,
      dynamic: true,
    }
  }

  if (typeof value === "string") {
    return {
      filename: value,
      inline: undefined,
      dynamic: true,
    }
  }

  return {
    inline: value.inline,
    filename: value.filename,
    dynamic: value.dynamic ?? true,
  }
}
