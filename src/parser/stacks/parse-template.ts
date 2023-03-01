import { TemplateConfig } from "../../config/common-config.js"

export const parseTemplate = (value: any): TemplateConfig | undefined => {
  if (value === null || value === undefined) {
    return undefined
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
