import readdirp from "readdirp"
import { TakomoError } from "../../utils/errors"
import { dirExists, FilePath } from "../../utils/files"
import { TkmLogger } from "../../utils/logging"
import { HandlebarsTemplateEngine } from "./handlebars-template-engine"

export const loadHandlebarsHelpers = async (
  helpersDirs: ReadonlyArray<FilePath>,
  logger: TkmLogger,
  te: HandlebarsTemplateEngine,
): Promise<void> => {
  for (const helpersDir of helpersDirs) {
    if (!(await dirExists(helpersDir))) {
      throw new TakomoError(`Helpers dir ${helpersDir} does not exists`)
    }

    const helperFiles = await readdirp.promise(helpersDir, {
      alwaysStat: true,
      depth: 100,
      type: "files",
      fileFilter: (e) => e.basename.endsWith(".js"),
    })

    for (const helperFile of helperFiles) {
      // eslint-disable-next-line
      const helper = require(helperFile.fullPath)
      if (!helper.name) {
        throw new TakomoError(
          `Helper name not defined in ${helperFile.fullPath}`,
        )
      }
      if (!helper.fn) {
        throw new TakomoError(`Helper fn not defined in ${helperFile.fullPath}`)
      }

      logger.debug(`Register helper: ${helper.name}`)
      te.registerHelper(helper.name, helper.fn)
    }
  }
}
