import {
  RenderTemplateFileProps,
  RenderTemplateProps,
  TakomoConfig,
  TakomoConfigProvider,
  TemplateEngine,
} from "../../../dist/index.js"
import { readFileContents } from "../../../src/utils/files.js"

const provider: TakomoConfigProvider = async (): Promise<TakomoConfig> => {
  return {
    templateEngineProvider: {
      init: async (): Promise<TemplateEngine> => {
        const renderTemplate = async ({
          templateString,
          variables,
        }: RenderTemplateProps) => {
          let rendered = templateString
          for (const [key, value] of Array.from(
            Object.entries((variables as any).var),
          )) {
            while (rendered.includes(`@var.${key}@`)) {
              rendered = rendered.replace(`@var.${key}@`, `${value}`)
            }
          }

          return rendered
        }

        const renderTemplateFile = async ({
          pathToFile,
          variables,
        }: RenderTemplateFileProps) => {
          const templateString = await readFileContents(pathToFile)
          return renderTemplate({ templateString, variables })
        }

        return {
          renderTemplate,
          renderTemplateFile,
        }
      },
    },
  }
}

export default provider
