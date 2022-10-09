import readdirp from "readdirp"
import {
  dirExists,
  FilePath,
  readFileContents,
  TakomoError,
  TemplateEngine,
  TkmLogger,
} from "../takomo-util"

export const loadTemplateHelpers = async (
  helpersDirs: ReadonlyArray<FilePath>,
  logger: TkmLogger,
  te: TemplateEngine,
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

export const loadTemplatePartials = async (
  partialsDirs: ReadonlyArray<FilePath>,
  logger: TkmLogger,
  te: TemplateEngine,
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
      const name = partialFile.fullPath.substr(partialsDir.length + 1)

      logger.debug(
        `Register partial '${name}' from file ${partialFile.fullPath}`,
      )
      const contents = await readFileContents(partialFile.fullPath)
      te.registerPartial(name, contents, partialFile.fullPath)
    }
  }
}
