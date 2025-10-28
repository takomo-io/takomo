import * as z from "zod"
import { expandFilePath, fileExists, readFileContents } from "../utils/files.js"
import {
  ResolverProvider,
  ResolverProviderZodSchemaProps,
} from "./resolver-provider.js"
import { Resolver, ResolverInput } from "./resolver.js"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const init = async ({ file }: any): Promise<Resolver> => {
  if (!file) {
    throw new Error("file is required property")
  }

  return {
    resolve: async ({
      logger,
      parameterName,
      ctx,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const zodSchema = ({
  base,
  zod,
}: ResolverProviderZodSchemaProps): z.ZodObject =>
  base.extend({
    file: zod.string().min(1),
  })

export const createFileContentsResolverProvider = (): ResolverProvider => ({
  name,
  init,
  zodSchema,
})
