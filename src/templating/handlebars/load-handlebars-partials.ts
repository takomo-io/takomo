import readdirp from "readdirp"
import { TakomoError } from "../../utils/errors.js"
import { dirExists, FilePath } from "../../utils/files.js"
import { TkmLogger } from "../../utils/logging.js"
import { HandlebarsTemplateEngine } from "./handlebars-template-engine.js"

export const loadHandlebarsPartials = async (
  partialsDirs: ReadonlyArray<FilePath>,
  logger: TkmLogger,
  te: HandlebarsTemplateEngine,
): Promise<void> => {
  for (const partialsDir of partialsDirs) {
    if (!(await dirExists(partialsDir))) {
      throw new TakomoError(`Partials dir ${partialsDir} does not exists`)
    }

    const partialFiles = await readdirp.promise(partialsDir, {
      alwaysStat: true,
      depth: 100,
      type: "files",
    })

    for (const partialFile of partialFiles) {
      const name = partialFile.fullPath.slice(partialsDir.length + 1)
      await te.registerPartial(name, partialFile.fullPath)
    }
  }
}
