import Joi from "@hapi/joi"
import { CommandStatus, Constants, project, region } from "@takomo/core"
import {
  createDir,
  createFile,
  dirExists,
  TakomoError,
  validateInput,
} from "@takomo/util"
import path from "path"
import {
  InitProjectInput,
  InitProjectIO,
  InitProjectOutput,
  ProjectInformation,
} from "./model"
import { createSampleFiles } from "./samples"

const schema = Joi.object({
  project: project,
  regions: Joi.array().items(region).unique(),
  createSamples: Joi.boolean(),
}).unknown(true)

const pathsToDirectories = (projectDir: string): string[] =>
  [
    Constants.STACKS_DIR,
    Constants.TEMPLATES_DIR,
    Constants.RESOLVERS_DIR,
    Constants.HOOKS_DIR,
    Constants.PARTIALS_DIR,
    Constants.HELPERS_DIR,
  ].map((d) => path.join(projectDir, d))

const checkForExistingDirs = async (
  projectDir: string,
  dirs: string[],
): Promise<void> => {
  const existingDirs = []
  for (const dir of dirs) {
    if (await dirExists(dir)) {
      existingDirs.push(dir)
    }
  }

  if (existingDirs.length > 0) {
    const existingDirsString = existingDirs
      .map((d) => `  - ${d.split(path.sep).pop()}`)
      .join("\n")
    throw new TakomoError(
      `Could not initialize a new project in directory: ${projectDir}. ` +
        "Following directories already exists in the target directory:\n\n" +
        existingDirsString,
    )
  }
}

const createDirs = async (dirs: string[]): Promise<void> => {
  await Promise.all(dirs.map(async (d) => createDir(d)))
}

const createRootStackConfigFile = async (
  projectDir: string,
  info: ProjectInformation,
): Promise<void> => {
  const rootStackGroupFile = path.join(
    projectDir,
    Constants.STACKS_DIR,
    Constants.STACK_GROUP_CONFIG_FILE,
  )

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

const createSamples = async (
  projectDir: string,
  info: ProjectInformation,
): Promise<void> => {
  if (!info.createSamples) {
    return
  }

  return createSampleFiles(projectDir)
}

const createDescription = (
  projectDir: string,
  info: ProjectInformation,
): string =>
  info.createSamples
    ? ".\n" +
      "├─ stacks            # dir for stack configuration files\n" +
      "│  ├- vpc.yml        # configuration file for sample vpc stack\n" +
      "│  └─ config.yml     # root stack group configuration file\n" +
      "├─ templates         # dir for CloudFormation template files\n" +
      "│  └─ vpc.yml        # CloudFormation template for sample vpc stack\n" +
      "├─ helpers           # dir for custom Handlebars helpers\n" +
      "├- partials          # dir for custom Handlebars partials\n" +
      "├- resolvers         # dir for custom resolvers\n" +
      "└- hooks             # dir for custom hooks\n"
    : ".\n" +
      "├─ stacks            # dir for stack configuration files\n" +
      "│  └─ config.yml     # root stack group configuration file\n" +
      "├─ templates         # dir for CloudFormation template files\n" +
      "├─ helpers           # dir for custom Handlebars helpers\n" +
      "├- partials          # dir for custom Handlebars partials\n" +
      "├- resolvers         # dir for custom resolvers\n" +
      "└- hooks             # dir for custom hooks\n"

const initProject = async (
  input: InitProjectInput,
  io: InitProjectIO,
): Promise<InitProjectOutput> => {
  const { options } = input

  const projectDir = options.getProjectDir()
  const dirs = pathsToDirectories(projectDir)

  await checkForExistingDirs(projectDir, dirs)

  const info = await io.promptProjectInformation(input)

  await createDirs(dirs)
  await createRootStackConfigFile(projectDir, info)
  await createSamples(projectDir, info)

  const description = createDescription(projectDir, info)

  return {
    projectDir,
    description,
    message: "Success",
    status: CommandStatus.SUCCESS,
    success: true,
    watch: input.watch.stop(),
  }
}

export const initProjectCommand = async (
  input: InitProjectInput,
  io: InitProjectIO,
): Promise<InitProjectOutput> =>
  validateInput(schema, input)
    .then((input) => initProject(input, io))
    .then(io.printOutput)
