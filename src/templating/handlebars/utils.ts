import { TakomoError } from "../../utils/errors.js"
import { FilePath } from "../../utils/files.js"
import { buildErrorMessage } from "../../utils/templating.js"
import { TemplateEngine } from "../template-engine.js"

export const renderTemplate = async (
  te: TemplateEngine,
  filePath: FilePath,
  templateString: string,
  variables: unknown,
): Promise<string> => {
  try {
    return te.renderTemplate({ templateString, variables })
  } catch (e: any) {
    const errorMessage = buildErrorMessage(
      `An error occurred while rendering file: ${filePath}`,
      templateString,
      e,
    )
    throw new TakomoError(errorMessage)
  }
}
