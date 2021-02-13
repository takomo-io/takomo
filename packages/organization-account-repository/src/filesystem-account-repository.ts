import {
  createFile,
  deepFreeze,
  dirExists,
  expandDir,
  FilePath,
  formatYaml,
  parseYaml,
  readFileContents,
  renderTemplate,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import { join } from "path"
import readdirp from "readdirp"
import {
  AccountConfigItem,
  AccountConfigItemWrapper,
  AccountRepository,
  AccountRepositoryProvider,
} from "./account-repository"

const loadAccountFile = async (
  templateEngine: TemplateEngine,
  variables: any,
  pathToFile: FilePath,
): Promise<AccountConfigItemWrapper> => {
  const contents = await readFileContents(pathToFile)
  const rendered = await renderTemplate(
    templateEngine,
    pathToFile,
    contents,
    variables,
  )

  const item = (await parseYaml(pathToFile, rendered)) as AccountConfigItem
  return {
    item,
    source: pathToFile,
  }
}

export const createFileSystemAccountRepositoryProvider = (): AccountRepositoryProvider => {
  return {
    initAccountRepository: async ({
      templateEngine,
      logger,
      ctx,
      config,
    }): Promise<AccountRepository> => {
      if (config.dir === undefined || config.dir === null) {
        throw new TakomoError(
          "Invalid account repository config - 'dir' property not found",
        )
      }

      const accountsDir = config.dir
      if (typeof accountsDir !== "string") {
        throw new TakomoError(
          "Invalid account repository config - 'dir' property must be of type 'string'",
        )
      }

      const expandedDir = expandDir(ctx.projectDir, accountsDir)

      if (!(await dirExists(expandedDir))) {
        throw new TakomoError(
          `Invalid account repository config - directory '${expandedDir}' given in 'dir' property does not exist`,
        )
      }

      logger.debug(`Load accounts from dir: ${expandedDir}`)

      const accountFiles = await readdirp.promise(expandedDir, {
        alwaysStat: true,
        depth: 100,
        type: "files",
        fileFilter: (e) => e.basename.endsWith(".yml"),
      })

      const accounts = await Promise.all(
        accountFiles.map((f) =>
          loadAccountFile(templateEngine, ctx.variables, f.fullPath),
        ),
      )

      logger.debug(
        `Loaded ${accounts.length} accounts from dir: ${expandedDir}`,
      )

      return {
        putAccount: async (item: AccountConfigItem): Promise<void> => {
          const pathToFile = join(expandedDir, `${item.accountId}.yml`)
          logger.info(
            `Persist account '${item.accountId}' to file: ${pathToFile}`,
          )
          const contents = formatYaml(item)
          logger.trace("File contents:", () => contents)
          await createFile(pathToFile, contents)
        },
        listAccounts: async (): Promise<
          ReadonlyArray<AccountConfigItemWrapper>
        > => deepFreeze(accounts),
      }
    },
  }
}
