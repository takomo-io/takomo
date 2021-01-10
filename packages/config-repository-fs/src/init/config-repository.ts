import { CommandContext } from "@takomo/core"
import {
  ProjectConfigRepository,
  ProjectInformation,
} from "@takomo/init-command"
import {
  createDir,
  createFile,
  dirExists,
  FilePath,
  TakomoError,
  TkmLogger,
} from "@takomo/util"
import Table from "easy-table"
import { basename, join } from "path"
import { createSampleFiles } from "./samples"

interface FileSystemProjectConfigRepositoryProps {
  readonly ctx: CommandContext
  readonly logger: TkmLogger
  readonly projectDir: FilePath
  readonly stacksDir: FilePath
  readonly resolversDir: FilePath
  readonly hooksDir: FilePath
  readonly helpersDir: FilePath
  readonly partialsDir: FilePath
  readonly templatesDir: FilePath
  readonly stackGroupConfigFileName: string
}

const createDescription = (
  {
    stacksDir,
    helpersDir,
    hooksDir,
    partialsDir,
    templatesDir,
    resolversDir,
  }: FileSystemProjectConfigRepositoryProps,
  createSamples: boolean,
): string => {
  const table = new Table()

  table.cell("dir", ".").cell("comment", "").newRow()
  table
    .cell("dir", `├─ ${basename(stacksDir)}`)
    .cell("comment", "# dir for stack configuration files")
    .newRow()

  if (createSamples) {
    table
      .cell("dir", "│  ├- vpc.yml")
      .cell("comment", "# configuration file for sample vpc stack")
      .newRow()
  }

  table
    .cell("dir", "│  └─ config.yml")
    .cell("comment", "# root stack group configuration file")
    .newRow()
  table
    .cell("dir", `├─ ${basename(templatesDir)}`)
    .cell("comment", "# dir for CloudFormation template files")
    .newRow()

  if (createSamples) {
    table
      .cell("dir", "│  └─ vpc.yml")
      .cell("comment", "# CloudFormation template for sample vpc stack")
      .newRow()
  }

  table
    .cell("dir", `├─ ${basename(helpersDir)}`)
    .cell("comment", "# dir for custom Handlebars helpers")
    .newRow()
  table
    .cell("dir", `├─ ${basename(partialsDir)}`)
    .cell("comment", "# dir for custom Handlebars partials")
    .newRow()
  table
    .cell("dir", `├─ ${basename(resolversDir)}`)
    .cell("comment", "# dir for custom resolvers")
    .newRow()
  table
    .cell("dir", `└─ ${basename(hooksDir)}`)
    .cell("comment", "# dir for custom hooks")
    .newRow()

  return table.print()
}

const checkForExistingDirs = async (
  projectDir: FilePath,
  dirs: ReadonlyArray<FilePath>,
): Promise<void> => {
  const dirsWithInfo = await Promise.all(
    dirs.map(async (dir) => ({
      dir: basename(dir),
      exists: await dirExists(dir),
    })),
  )

  const existingDirs = dirsWithInfo.filter((d) => d.exists).map((d) => d.dir)

  if (existingDirs.length > 0) {
    const existingDirsString = existingDirs.map((d) => `  - ${d}`).join("\n")
    throw new TakomoError(
      `Could not initialize a new project in directory: ${projectDir}.\n\n` +
        "Following directories already exists in the target directory:\n\n" +
        existingDirsString,
    )
  }
}

const createDirs = async (dirs: ReadonlyArray<FilePath>): Promise<void> => {
  await Promise.all(dirs.map(async (d) => createDir(d)))
}

const createRootStackConfigFile = async (
  rootStackGroupFile: FilePath,
  info: ProjectInformation,
): Promise<void> => {
  let contents = ""
  if (info.project) {
    contents += `project: ${info.project}\n`
  }
  if (info.regions.length === 1) {
    contents += `regions: ${info.regions[0]}\n`
  } else if (info.regions.length > 1) {
    contents += `regions:\n`
    info.regions.forEach((r) => (contents += `  - ${r}\n`))
  }

  await createFile(rootStackGroupFile, contents)
}

export const createFileSystemProjectConfigRepository = async (
  props2: FileSystemProjectConfigRepositoryProps,
): Promise<ProjectConfigRepository> => {
  const {
    projectDir,
    stacksDir,
    templatesDir,
    partialsDir,
    hooksDir,
    helpersDir,
    resolversDir,
    stackGroupConfigFileName,
  } = props2

  const dirs = [
    stacksDir,
    templatesDir,
    partialsDir,
    hooksDir,
    helpersDir,
    resolversDir,
  ]

  const putProjectConfig = async (
    info: ProjectInformation,
  ): Promise<string> => {
    const { createSamples } = info
    await checkForExistingDirs(projectDir, dirs)

    await createDirs(dirs)

    const pathToRootConfigFile = join(stacksDir, stackGroupConfigFileName)
    await createRootStackConfigFile(pathToRootConfigFile, info)

    if (createSamples) {
      await createSampleFiles(stacksDir, templatesDir)
    }

    return createDescription(props2, createSamples)
  }

  return {
    putProjectConfig,
  }
}
