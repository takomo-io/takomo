import { initDefaultCredentialManager } from "@takomo/aws-clients"
import { formatCommandStatus } from "@takomo/cli-io"
import {
  CommandContext,
  CommandHandler,
  CommandInput,
  CommandOutput,
  ContextVars,
  IO,
  Variables,
} from "@takomo/core"
import {
  createLogger,
  createTimer,
  deepFreeze,
  expandFilePath,
  fileExists,
  FilePath,
  indentLines,
  LogLevel,
  parseYamlFile,
  printTimer,
  readFileContents,
  red,
  TakomoError,
  TkmLogger,
} from "@takomo/util"
import { Credentials } from "aws-sdk"
import dotenv from "dotenv"
import dotenvExpand from "dotenv-expand"
import Table from "easy-table"
import inquirer from "inquirer"
import merge from "lodash.merge"
import os from "os"
import path from "path"
import prettyMs from "pretty-ms"
import { CliCommandContext, ProjectFilePaths } from "./cli-command-context"
import { loadProjectConfig } from "./config"
import {
  CONFIG_FILE_EXTENSION,
  DEFAULT_DEPLOYMENT_CONFIG_FILE,
  DEFAULT_ORGANIZATION_CONFIG_FILE,
  DEPLOYMENT_DIR,
  HELPERS_DIR,
  HOOKS_DIR,
  ORGANIZATION_DIR,
  PARTIALS_DIR,
  RESOLVERS_DIR,
  SCHEMAS_DIR,
  STACKS_DIR,
  STACK_GROUP_CONFIG_FILE_NAME,
  TAKOMO_PROJECT_CONFIG_FILE_NAME,
  TEMPLATES_DIR,
} from "./constants"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require("../package.json")

const organizationServicePrincipals = [
  "aws-artifact-account-sync.amazonaws.com",
  "backup.amazonaws.com",
  "cloudtrail.amazonaws.com",
  "compute-optimizer.amazonaws.com",
  "config.amazonaws.com",
  "ds.amazonaws.com",
  "fms.amazonaws.com",
  "license-manager.amazonaws.com",
  "member.org.stacksets.cloudformation.amazonaws.com",
  "ram.amazonaws.com",
  "servicecatalog.amazonaws.com",
  "ssm.amazonaws.com",
  "sso.amazonaws.com",
  "tagpolicies.tag.amazonaws.com",
]

export const readConfigurationFromFiles = async (
  projectDir: FilePath,
  args: any,
): Promise<Record<string, unknown>> => {
  const filePaths = args ? (Array.isArray(args) ? args : [args]) : []
  const config = {}
  for (const filePath of filePaths) {
    const configFromFile = await readVariablesFromFile(projectDir, filePath)
    if (typeof configFromFile !== "object") {
      throw new TakomoError(
        `Contents of configuration file ${filePath} could not be deserialized to an object`,
      )
    }

    merge(config, configFromFile)
  }

  return config
}

const readVariablesFromFile = async (
  projectDir: FilePath,
  fileName: FilePath,
): Promise<any> => {
  const pathToVarsFile = expandFilePath(projectDir, fileName)

  if (!(await fileExists(pathToVarsFile))) {
    throw new TakomoError(`Variable file ${pathToVarsFile} not found`)
  }

  if (pathToVarsFile.endsWith(".json")) {
    const contents = await readFileContents(pathToVarsFile)
    return JSON.parse(contents)
  }

  if (pathToVarsFile.endsWith(".yml")) {
    return parseYamlFile(pathToVarsFile)
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
    const pathToEnvVarsFile = expandFilePath(projectDir, envArg)

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
      return "trace"
    case "debug":
      return "debug"
    case "info":
      return "info"
    case "warn":
      return "warn"
    case "error":
      return "error"
    default:
      return "info"
  }
}

export const initCommandContext = async (
  argv: any,
  credentials?: Credentials,
): Promise<CliCommandContext> => {
  if (argv.profile) {
    process.env.AWS_PROFILE = argv.profile
  }

  if (argv["load-aws-sdk-config"]) {
    process.env.AWS_SDK_LOAD_CONFIG = "true"
  }

  const projectDir = resolveProjectDir(argv.dir)
  const logLevel = resolveLogLevel(argv.log)

  const variables = await parseVariables(
    projectDir,
    argv["var-file"],
    argv.var,
    argv["env-file"],
  )

  const filePaths: ProjectFilePaths = {
    projectDir,
    hooksDir: path.join(projectDir, HOOKS_DIR),
    helpersDir: path.join(projectDir, HELPERS_DIR),
    partialsDir: path.join(projectDir, PARTIALS_DIR),
    resolversDir: path.join(projectDir, RESOLVERS_DIR),
    stacksDir: path.join(projectDir, STACKS_DIR),
    templatesDir: path.join(projectDir, TEMPLATES_DIR),
    schemasDir: path.join(projectDir, SCHEMAS_DIR),
    projectConfigFile: path.join(projectDir, TAKOMO_PROJECT_CONFIG_FILE_NAME),
    projectConfigFileName: TAKOMO_PROJECT_CONFIG_FILE_NAME,
    stackGroupConfigFileName: STACK_GROUP_CONFIG_FILE_NAME,
    configFileExtension: CONFIG_FILE_EXTENSION,
    defaultDeploymentConfigFileName: DEFAULT_DEPLOYMENT_CONFIG_FILE,
    deploymentDir: path.join(projectDir, DEPLOYMENT_DIR),
    organizationDir: path.join(projectDir, ORGANIZATION_DIR),
    organizationTagPoliciesDir: path.join(
      projectDir,
      ORGANIZATION_DIR,
      "tag-policies",
    ),
    organizationBackupPoliciesDir: path.join(
      projectDir,
      ORGANIZATION_DIR,
      "backup-policies",
    ),
    organizationServiceControlPoliciesDir: path.join(
      projectDir,
      ORGANIZATION_DIR,
      "service-control-policies",
    ),
    organizationAiServicesOptOutPoliciesDir: path.join(
      projectDir,
      ORGANIZATION_DIR,
      "ai-services-opt-out-policies",
    ),
    defaultOrganizationConfigFileName: DEFAULT_ORGANIZATION_CONFIG_FILE,
  }

  const projectConfig = await loadProjectConfig(filePaths.projectConfigFile)

  return deepFreeze({
    regions: projectConfig.regions.slice(),
    credentials,
    logLevel,
    variables,
    filePaths,
    projectConfig,
    autoConfirmEnabled: argv.yes === true,
    statisticsEnabled: argv.stats === true,
    confidentialValuesLoggingEnabled: argv["log-confidential-info"] === true,
    organizationServicePrincipals: organizationServicePrincipals.slice(),
    projectDir: filePaths.projectDir,
  })
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
  console.log()
  console.log(red("OTHER INFO"))
  console.log(red("----------"))
  console.log(red("Your environment:"))
  console.log(red(`  OS:              ${os.platform()}`))
  console.log(red(`  Node version:    ${process.version}`))
  console.log(red(`  Takomo version:  ${version}`))
  console.log()
  console.log(red("Get support:"))
  console.log(red(`  Docs:  https://takomo.io`))
  console.log(red(`  Bugs:  https://github.com/takomo-io/takomo/issues`))
  console.log()
  process.exit(1)
}

const toMB = (bytes: number): number =>
  Math.round((bytes / 1024 / 1024) * 100) / 100

export const onComplete = (
  ctx: CommandContext,
  output: CommandOutput,
): void => {
  if (ctx.statisticsEnabled) {
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
    console.log(indentLines(printTimer(output.timer)))
  }

  console.log()
  console.log(
    `Completed in ${prettyMs(
      output.timer.getSecondsElapsed(),
    )} with status: ${formatCommandStatus(output.status)}`,
  )
  console.log()

  if (!output.success) {
    process.exit(1)
  }
}

interface HandleProps<
  C,
  I extends IO<OUT>,
  IN extends CommandInput,
  OUT extends CommandOutput
> {
  argv: any
  input: (ctx: CliCommandContext, input: CommandInput) => Promise<IN>
  io: (ctx: CliCommandContext, logger: TkmLogger) => I
  configRepository: (ctx: CliCommandContext, logger: TkmLogger) => Promise<C>
  executor: CommandHandler<C, I, IN, OUT>
}

const promptMfaCode = async (mfaSerial: string): Promise<string> => {
  const { answer } = await inquirer.prompt([
    {
      message: `Enter MFA code for ${mfaSerial}`,
      type: "input",
      name: "answer",
    },
  ])

  return answer
}

export const handle = async <
  C,
  I extends IO<OUT>,
  IN extends CommandInput,
  OUT extends CommandOutput
>(
  props: HandleProps<C, I, IN, OUT>,
): Promise<void> => {
  try {
    const ctx = await initCommandContext(props.argv)
    const logger = createLogger({
      writer: console.log,
      logLevel: ctx.logLevel,
    })

    const input = await props.input(ctx, { timer: createTimer("total") })
    const io = props.io(ctx, logger)

    const configRepository = await props.configRepository(ctx, logger)
    const credentialManager = await initDefaultCredentialManager(
      promptMfaCode,
      ctx.credentials,
    )
    const output = await props.executor({
      ctx,
      configRepository,
      io,
      input,
      credentialManager,
    })
    onComplete(ctx, output)
  } catch (e) {
    onError(e)
  }
}

export const commonEpilog = (
  iamPolicyProvider: () => string,
): string => `Required minimum IAM policy to run this command:
${indentLines(iamPolicyProvider(), 2)}
For more information, visit https://takomo.io
`
