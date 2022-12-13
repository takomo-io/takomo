import { TakomoError } from "../../utils/errors"
import { FilePath } from "../../utils/files"
import { buildErrorMessage } from "../../utils/templating"
import { TemplateEngine } from "../template-engine"

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
