import { ObjectSchema } from "joi"
import { expandFilePath, fileExists, readFileContents } from "../utils/files.js"
import {
  ResolverProvider,
  ResolverProviderSchemaProps,
} from "./resolver-provider.js"
import { Resolver, ResolverInput } from "./resolver.js"

const init = async ({ file }: any): Promise<Resolver> => {
  if (!file) {
    throw new Error("file is required property")
  }

  return {
    resolve: async ({
      logger,
      parameterName,
      ctx,
    }: ResolverInput): Promise<any> => {
      logger.debug(
        `Resolving value for parameter '${parameterName}' from file: ${file}`,
      )

      const expandedFilePath = expandFilePath(ctx.projectDir, file)
      if (!(await fileExists(expandedFilePath))) {
        throw new Error(`File ${expandedFilePath} not found`)
      }

      return readFileContents(expandedFilePath).then((contents) =>
        contents.trim(),
      )
    },
  }
}

const name = "file-contents"

const schema = ({ joi, base }: ResolverProviderSchemaProps): ObjectSchema =>
  base.keys({
    file: joi.string().required(),
  })

export const createFileContentsResolverProvider = (): ResolverProvider => ({
  name,
  init,
  schema,
})
