import { formatCommandStatus } from "@takomo/cli-io"
import {
  CommandInput,
  CommandOutput,
  Constants,
  ContextVars,
  Options,
  parseProjectConfigFile,
  Variables,
} from "@takomo/core"
import {
  fileExists,
  indentLines,
  LogLevel,
  parseYamlFile,
  printStopWatch,
  readFileContents,
  red,
  StopWatch,
  TakomoError,
} from "@takomo/util"
import dotenv from "dotenv"
import dotenvExpand from "dotenv-expand"
import Table from "easy-table"
import merge from "lodash.merge"
import path from "path"
import prettyMs from "pretty-ms"

const readVariablesFromFile = async (
  projectDir: string,
  fileName: string,
): Promise<any> => {
  const pathToVarsFile = path.join(projectDir, fileName)

  if (!(await fileExists(pathToVarsFile))) {
    throw new TakomoError(`Variable file ${pathToVarsFile} not found`)
  }

  if (pathToVarsFile.endsWith(".json")) {
    const contents = await readFileContents(pathToVarsFile)
    return JSON.parse(contents)
  }

  if (pathToVarsFile.endsWith(".yml")) {
    return await parseYamlFile(pathToVarsFile)
  }

  return (await readFileContents(pathToVarsFile)).trim()
}

export const parseVarFileArgs = async (
  projectDir: string,
  varFileArgs: any,
): Promise<any> => {
  const varsArray = varFileArgs
    ? Array.isArray(varFileArgs)
      ? varFileArgs
      : [varFileArgs]
    : []

  const vars = {}
  for (const varArg of varsArray) {
    if (/^([a-zA-Z][a-zA-Z0-9_]+)=/.test(varArg)) {
      const [varName, varValue] = varArg.split("=", 2)
      const varsFromFile = await readVariablesFromFile(projectDir, varValue)
      merge(vars, { [varName]: varsFromFile })
    } else {
      const varsFromFile = await readVariablesFromFile(projectDir, varArg)
      if (typeof varsFromFile !== "object") {
        throw new TakomoError(
          `Contents of variable file ${varArg} could not be deserialized to an object`,
        )
      }

      merge(vars, varsFromFile)
    }
  }

  return vars
}

export const parseVarArgs = (varArgs: any, vars: any): any => {
  const varsArray = varArgs
    ? Array.isArray(varArgs)
      ? varArgs
      : [varArgs]
    : []

  for (const varArg of varsArray) {
    if (/^([a-zA-Z][a-zA-Z0-9_]+)=/.test(varArg)) {
      const [varName, varValue] = varArg.split("=", 2)
      merge(vars, { [varName]: varValue })
    } else {
      throw new TakomoError(`Invalid variable ${varArg}`)
    }
  }

  return vars
}

const loadEnvironmentVariables = (): any =>
  Object.keys(process.env).reduce((collected, key) => {
    return { ...collected, [key]: process.env[key] }
  }, {})

const loadContextVariables = (projectDir: string): ContextVars => ({
  projectDir,
})

const overrideEnvironmentVariablesFromEnvironmentVariablesFiles = async (
  projectDir: string,
  envFileArgs: any,
): Promise<void> => {
  const envArray = envFileArgs
    ? Array.isArray(envFileArgs)
      ? envFileArgs
      : [envFileArgs]
    : []

  for (const envArg of envArray) {
    const pathToEnvVarsFile = path.join(projectDir, envArg)

    if (!(await fileExists(pathToEnvVarsFile))) {
      throw new TakomoError(
        `Environment variables file ${pathToEnvVarsFile} not found`,
      )
    }

    const contents = await readFileContents(pathToEnvVarsFile)
    const envConfig = dotenv.parse(contents)
    dotenvExpand(envConfig)

    for (const k in envConfig) {
      process.env[k] = envConfig[k]
    }
  }
}

export const parseVariables = async (
  projectDir: string,
  varFileArgs: any,
  varArgs: any,
  envFileArgs: any,
): Promise<Variables> => {
  const fileVars = await parseVarFileArgs(projectDir, varFileArgs)
  const vars = parseVarArgs(varArgs, fileVars)

  await overrideEnvironmentVariablesFromEnvironmentVariablesFiles(
    projectDir,
    envFileArgs,
  )

  const env = loadEnvironmentVariables()
  const context = loadContextVariables(projectDir)
  return {
    env,
    var: vars,
    context,
  }
}

const resolveProjectDir = (projectDirArg: any): string => {
  if (projectDirArg) {
    const projectDir = projectDirArg.toString()
    return projectDir.startsWith("/")
      ? projectDir
      : path.join(process.cwd(), projectDir)
  }

  return process.cwd()
}

const resolveLogLevel = (log: string): LogLevel => {
  switch (log) {
    case "trace":
      return LogLevel.TRACE
    case "debug":
      return LogLevel.DEBUG
    case "info":
      return LogLevel.INFO
    case "warn":
      return LogLevel.WARN
    case "error":
      return LogLevel.ERROR
    default:
      return LogLevel.INFO
  }
}

export interface OptionsAndVariables {
  readonly options: Options
  readonly variables: Variables
  readonly watch: StopWatch
}

export const initOptionsAndVariables = async (
  argv: any,
): Promise<OptionsAndVariables> => {
  if (argv.profile) {
    process.env.AWS_PROFILE = argv.profile
  }

  if (argv["load-aws-sdk-config"]) {
    process.env.AWS_SDK_LOAD_CONFIG = "true"
  }

  const projectDir = resolveProjectDir(argv.dir)
  const logLevel = resolveLogLevel(argv.log)

  const options = new Options({
    logLevel,
    projectDir,
    autoConfirm: argv.yes === true,
    stats: argv.stats === true,
    logConfidentialInfo: argv["log-confidential-info"] === true,
  })

  const variables = await parseVariables(
    projectDir,
    argv["var-file"],
    argv.var,
    argv["env-file"],
  )

  return {
    options,
    variables,
    watch: new StopWatch("total"),
  }
}

export const onError = (e: any): void => {
  console.log()
  console.log(red("ERROR"))
  console.log(red("-----"))

  if (e.isTakomoError) {
    console.log(red(e.message))

    if (e.info) {
      console.log()
      console.log(red("[!] Additional info:"))
      console.log()
      console.log(red(`  ${e.info}`))
    }

    if (e.instructions) {
      console.log()
      console.log(red("[!] How to fix:"))
      console.log()
      e.instructions.forEach((instruction: any) => {
        console.log(red(`  - ${instruction}`))
      })
    }
  } else {
    console.log(red(e.stack))
  }

  console.log()
  process.exit(1)
}

const toMB = (bytes: number): number =>
  Math.round((bytes / 1024 / 1024) * 100) / 100

export const onComplete = (options: Options, output: CommandOutput): void => {
  if (options.isStatsEnabled()) {
    const { heapUsed, heapTotal, external, rss } = process.memoryUsage()

    const table = new Table()

    console.log()
    console.log("Memory usage:")
    console.log()

    table.cell("Segment", "rss")
    table.cell("MB", toMB(rss))
    table.newRow()

    table.cell("Segment", "heap total")
    table.cell("MB", toMB(heapTotal))
    table.newRow()

    table.cell("Segment", "heap used")
    table.cell("MB", toMB(heapUsed))
    table.newRow()

    table.cell("Segment", "external")
    table.cell("MB", toMB(external))
    table.newRow()

    console.log(indentLines(table.toString()))

    console.log("Execution times:")
    console.log()
    console.log(indentLines(printStopWatch(output.watch)))
  }

  console.log()
  console.log(
    `Completed in ${prettyMs(
      output.watch.secondsElapsed,
    )} with status: ${formatCommandStatus(output.status)}`,
  )
  console.log()

  if (!output.success) {
    process.exit(1)
  }
}

export const loadProjectConfig = async (projectDir: string): Promise<void> => {
  const pathConfigFile = path.join(
    projectDir,
    Constants.BAUBLE_PROJECT_CONFIG_FILE,
  )

  if (!(await fileExists(pathConfigFile))) {
    return
  }

  await parseProjectConfigFile(pathConfigFile)
}

export const handle = async <I extends CommandInput, O extends CommandOutput>(
  argv: any,
  makeInput: (ov: OptionsAndVariables) => I,
  executor: (input: I) => Promise<O>,
): Promise<void> => {
  try {
    const ov = await initOptionsAndVariables(argv)
    await loadProjectConfig(ov.options.getProjectDir())
    const input = makeInput(ov)
    const output = await executor(input)
    onComplete(ov.options, output)
  } catch (e) {
    onError(e)
  }
}
