import { OrganizationalUnitPath } from "@takomo/organization-model"
import {
  createFile,
  deepFreeze,
  dirExists,
  expandFilePath,
  FilePath,
  formatYaml,
  parseYaml,
  readFileContents,
  renderTemplate,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import { dirname, join, relative } from "path"
import R from "ramda"
import readdirp from "readdirp"
import {
  AccountConfigItem,
  AccountConfigItemWrapper,
  AccountRepository,
  AccountRepositoryProvider,
} from "./account-repository"
import { InvalidAccountFileLocationError } from "./errors"

export const inferOUPathFromFilePath = (
  baseDir: FilePath,
  pathToFile: FilePath,
): OrganizationalUnitPath => {
  const parentDir = dirname(pathToFile)
  if (parentDir === baseDir) {
    throw new InvalidAccountFileLocationError(pathToFile, baseDir)
  }

  return relative(baseDir, parentDir)
}

interface LoadAccountFileProps {
  readonly templateEngine: TemplateEngine
  readonly variables: any
  readonly baseDir: FilePath
  readonly pathToFile: FilePath
  readonly inferOUPathFromDirName: boolean
}

const loadAccountFile = async ({
  templateEngine,
  inferOUPathFromDirName,
  variables,
  pathToFile,
  baseDir,
}: LoadAccountFileProps): Promise<AccountConfigItemWrapper> => {
  const contents = await readFileContents(pathToFile)
  const rendered = await renderTemplate(
    templateEngine,
    pathToFile,
    contents,
    variables,
  )

  const item = (await parseYaml(pathToFile, rendered)) as AccountConfigItem

  if (inferOUPathFromDirName) {
    const organizationalUnitPath = inferOUPathFromFilePath(baseDir, pathToFile)

    return {
      item: {
        ...item,
        organizationalUnitPath,
      },
      source: pathToFile,
    }
  }

  return {
    item,
    source: pathToFile,
  }
}

export const createFileSystemAccountRepositoryProvider =
  (): AccountRepositoryProvider => {
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

        const inferOUPathFromDirName = config.inferOUPathFromDirName ?? false
        if (typeof inferOUPathFromDirName !== "boolean") {
          throw new TakomoError(
            "Invalid deployment target repository config - 'inferOUPathFromDirName' property must be of type 'boolean'",
          )
        }

        const expandedDir = expandFilePath(ctx.projectDir, accountsDir)

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
            loadAccountFile({
              templateEngine,
              inferOUPathFromDirName,
              variables: ctx.variables,
              baseDir: expandedDir,
              pathToFile: f.fullPath,
            }),
          ),
        )

        logger.debug(
          `Loaded ${accounts.length} accounts from dir: ${expandedDir}`,
        )

        return {
          putAccount: async (item: AccountConfigItem): Promise<void> => {
            const pathToFile = inferOUPathFromDirName
              ? join(
                  expandedDir,
                  `${item.organizationalUnitPath}/${item.id}.yml`,
                )
              : join(expandedDir, `${item.id}.yml`)

            logger.info(`Persist account '${item.id}' to file: ${pathToFile}`)

            const preparedItem = inferOUPathFromDirName
              ? R.omit(["organizationalUnitPath"], item)
              : item

            const contents = formatYaml(preparedItem)
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
