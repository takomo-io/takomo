import {
  dirExists,
  FilePath,
  readFileContents,
  TakomoError,
  TemplateEngine,
  TkmLogger,
} from "@takomo/util"
import readdirp from "readdirp"

export const loadTemplateHelpers = async (
  helpersDir: FilePath,
  logger: TkmLogger,
  te: TemplateEngine,
) => {
  if (await dirExists(helpersDir)) {
    logger.debug(`Found helpers dir: ${helpersDir}`)

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
  } else {
    logger.debug("Helpers dir not found")
  }
}

export const loadTemplatePartials = async (
  partialsDir: FilePath,
  logger: TkmLogger,
  te: TemplateEngine,
): Promise<void> => {
  if (await dirExists(partialsDir)) {
    logger.debug(`Found partials dir: ${partialsDir}`)

    const partialFiles = await readdirp.promise(partialsDir, {
      alwaysStat: true,
      depth: 100,
      type: "files",
    })

    for (const partialFile of partialFiles) {
      const name = partialFile.fullPath.substr(partialsDir.length + 1)

      logger.debug(`Register partial: ${name}`)
      const contents = await readFileContents(partialFile.fullPath)
      te.registerPartial(name, contents)
    }
  } else {
    logger.debug("Partials dir not found")
  }
}
