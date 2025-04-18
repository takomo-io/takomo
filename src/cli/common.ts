import { AwsCredentialIdentity } from "@aws-sdk/types"
import Table from "easy-table"
import { createRequire } from "module"
import os from "os"
import * as R from "ramda"
import { Arguments } from "yargs"
import { createAwsClientProvider } from "../aws/aws-client-provider.js"
import { ApiCallProps } from "../aws/common/client.js"
import {
  CredentialManager,
  initDefaultCredentialManager,
  InternalCredentialManager,
} from "../aws/common/credentials.js"
import { formatCommandStatus } from "../cli-io/formatters.js"
import { InternalCommandContext } from "../context/command-context.js"
import { parseBoolean, parseStringArray } from "../parser/common-parser.js"
import {
  createFileSystemCommandContext,
  FileSystemCommandContext,
} from "../takomo-config-repository-fs/context/create-file-system-command-context.js"
import {
  CommandHandler,
  CommandInput,
  CommandOutput,
  IO,
} from "../takomo-core/command.js"
import { collectFromHierarchy } from "../utils/collections.js"
import { red } from "../utils/colors.js"
import { expandFilePath, FilePath } from "../utils/files.js"
import { createLogger, TkmLogger } from "../utils/logging.js"
import { indentLines } from "../utils/strings.js"
import { formatElapsedMillis, printTimer, Timer } from "../utils/timer.js"
import { RESET_CACHE_OPT } from "./constants.js"
import { parseFeaturesFromArgs } from "./options/parse-features-from-args.js"
import { parseLogLevel } from "./options/parse-log-level.js"
import { parseOutputFormat } from "./options/parse-output-format.js"
import { parseVarArgs } from "./options/parse-var-args.js"
import { parseVarFileOptions } from "./options/parse-var-file-options.js"
import _ from "lodash"
import { input } from "@inquirer/prompts"

export interface RunProps {
  readonly overridingHandler?: (args: Arguments) => void
  readonly showHelpOnFail?: boolean
}

const resolveProjectDir = (projectDirArg: unknown): FilePath => {
  if (projectDirArg) {
    const projectDir = projectDirArg.toString()
    return expandFilePath(process.cwd(), projectDir)
  }

  return process.cwd()
}

export const initCommandContext = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  argv: any,
  credentials?: AwsCredentialIdentity,
): Promise<FileSystemCommandContext> => {
  if (argv.profile) {
    process.env.AWS_PROFILE = argv.profile
  }

  const require = createRequire(import.meta.url)
  const packageJson = require("../../package.json")
  const buildInfo = {
    version: packageJson.version,
  }

  const statisticsEnabled = parseBoolean(argv.stats, false)
  const autoConfirmEnabled = parseBoolean(argv.yes, false)
  const quiet = parseBoolean(argv.quiet, false)
  const resetCache = parseBoolean(argv[RESET_CACHE_OPT], false)
  const projectDir = resolveProjectDir(argv.dir)
  const logLevel = parseLogLevel(argv.log, quiet)
  const outputFormat = parseOutputFormat(argv.output)
  const overrideFeatures = parseFeaturesFromArgs(argv.feature)
  const varFilePaths = parseVarFileOptions(argv["var-file"])
  const envFilePaths = parseStringArray(argv["env-file"])
  const vars = parseVarArgs(argv.var)

  const logger = createLogger({ logLevel, writer: console.log })
  const awsClientProvider = createAwsClientProvider({ logger })

  const iamGeneratePoliciesInstructionsEnabled = parseBoolean(
    argv["show-generate-iam-policies"],
    false,
  )

  const confidentialValuesLoggingEnabled = parseBoolean(
    argv["log-confidential-info"],
    false,
  )

  logger.debug(`Takomo v${packageJson.version}`)

  return createFileSystemCommandContext({
    quiet,
    resetCache,
    outputFormat,
    logLevel,
    autoConfirmEnabled,
    statisticsEnabled,
    iamGeneratePoliciesInstructionsEnabled,
    confidentialValuesLoggingEnabled,
    credentials,
    buildInfo,
    projectDir,
    awsClientProvider,
    overrideFeatures,
    vars,
    envFilePaths,
    varFilePaths,
    logger,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      e.instructions.forEach((instruction: unknown) => {
        console.log(red(`  - ${instruction}`))
      })
    }
  } else {
    console.log(red(e.stack))
  }

  const require = createRequire(import.meta.url)
  const packageJson = require("../../package.json")

  console.log()
  console.log()
  console.log(red("OTHER INFO"))
  console.log(red("----------"))
  console.log(red("Your environment:"))
  console.log(red(`  OS:              ${os.platform()}`))
  console.log(red(`  Node version:    ${process.version}`))
  console.log(red(`  Takomo version:  ${packageJson.version}`))
  console.log()
  console.log(red("Get support:"))
  console.log(red(`  Docs:      https://takomo.io`))
  console.log(red(`  Bugs:      https://github.com/takomo-io/takomo/issues`))
  console.log(red(`  Gitter:    https://gitter.im/takomo-io/community`))
  console.log(red(`  Telegram:  https://t.me/takomo_io`))
  console.log()
  process.exit(1)
}

const toMB = (bytes: number): number =>
  Math.round((bytes / 1024 / 1024) * 100) / 100

interface OnCompleteProps {
  readonly ctx: InternalCommandContext
  readonly output: CommandOutput
  readonly credentialManagers: ReadonlyArray<InternalCredentialManager>
  readonly startTime: Date
  readonly endTime: Date
}

export const onComplete = async ({
  ctx,
  output,
  credentialManagers,
  startTime,
  endTime,
}: OnCompleteProps): Promise<void> => {
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

    console.log()
    console.log("AWS API calls:")
    console.log()

    const clientsTable = new Table()

    const allApiCalls = ctx.awsClientProvider.getApiCalls()

    const apiCallsByClient = _.groupBy(allApiCalls, "clientId")
    const clientIds = Object.keys(apiCallsByClient).sort()
    clientIds.forEach((clientId) => {
      clientsTable.cell("Client id", clientId).newRow()
      const clientApiCalls = apiCallsByClient[clientId]
      const clientApiCallsByAction: Record<string, ApiCallProps[]> = _.groupBy(
        clientApiCalls,
        (a) => `${a.api}:${a.action}`,
      )
      const actionNames = Object.keys(clientApiCallsByAction).sort()
      actionNames.forEach((actionName) => {
        const calls = clientApiCallsByAction[actionName]

        const times = R.map(R.prop("time"), calls)
        const totalTime = R.sum(times)

        clientsTable
          .cell("Client id", `  ${actionName}`)
          .cell("Count", calls.length)
          .cell("Time total", formatElapsedMillis(totalTime))
          .cell("Time min", formatElapsedMillis(Math.min(...times)))
          .cell("Time max", formatElapsedMillis(Math.max(...times)))
          .cell("Time avg", formatElapsedMillis(totalTime / calls.length))
          .cell(
            "Retries",
            calls.reduce((sum, { retries }) => sum + retries, 0),
          )
          .newRow()
      })
    })

    clientsTable.newRow().cell("Client id", "Total").newRow()

    const totalApiCallsByAction: Record<string, ApiCallProps[]> = _.groupBy(
      allApiCalls,
      (a) => `${a.api}:${a.action}`,
    )
    Object.keys(totalApiCallsByAction)
      .sort()
      .forEach((action) => {
        const calls = totalApiCallsByAction[action]
        const times = R.map(R.prop("time"), calls)
        const totalTime = R.sum(times)

        clientsTable
          .cell("Client id", `  ${action}`)
          .cell("Count", calls.length)
          .cell("Time total", formatElapsedMillis(totalTime))
          .cell("Time min", formatElapsedMillis(Math.min(...times)))
          .cell("Time max", formatElapsedMillis(Math.max(...times)))
          .cell("Time avg", formatElapsedMillis(totalTime / calls.length))
          .cell(
            "Retries",
            calls.reduce((sum, { retries }) => sum + retries, 0),
          )
          .newRow()
      })

    console.log(indentLines(clientsTable.toString()))

    const identities = await Promise.all(
      credentialManagers.map((cm) => cm.getCallerIdentity()),
    )

    const identityArns = R.uniq(identities.map(R.prop("arn")))
    if (identityArns.length > 0) {
      console.log()
      console.log("AWS identities:")
      console.log()
      identityArns.forEach((arn) => {
        console.log(`  - ${arn}`)
      })
    }
  }

  if (ctx.iamGeneratePoliciesInstructionsEnabled) {
    const identities = await Promise.all(
      credentialManagers.map((cm) => cm.getCallerIdentity()),
    )

    const identityArns = R.uniq(identities.map(R.prop("arn")))

    console.log()
    console.log("Use this command to generate IAM policies:")
    console.log()
    console.log("  tkm iam generate-policies \\")
    console.log(`    --start-time ${startTime.toISOString()} \\`)
    console.log(`    --end-time ${endTime.toISOString()} \\`)
    identityArns.forEach((identity) => {
      console.log(`    --identity ${identity} \\`)
    })
    ctx.awsClientProvider.getRegions().forEach((region) => {
      console.log(`    --region ${region} \\`)
    })
    console.log("    --role-name <ROLE NAME>")
    console.log()
    console.log(
      "* Typically, the performed actions become visible in CloudTrail within 15 minutes.",
    )
    console.log(
      "  You should wait at least that time before running the command shown above to ensure",
    )
    console.log("  the generated policies contain all actions.")
    console.log(
      "* If you executed actions against multiple AWS accounts, use --role-name option",
    )
    console.log(
      "  to provide a name for the IAM role Takomo should assume to collect events from",
    )
    console.log(
      "  the accounts. The role should have permissions to read from CloudTrail. When",
    )
    console.log(
      "  generating the policies, you must run the command with credentials that have",
    )
    console.log("  permissions to assume the reader role.")
    console.log()
  }

  if (!ctx.quiet && output.outputFormat === "text") {
    console.log()
    console.log(
      `Completed in ${output.timer.getFormattedTimeElapsed()} with status: ${formatCommandStatus(
        output.status,
      )}`,
    )
    console.log()
  }

  if (!output.success) {
    process.exit(1)
  }
}

interface HandleProps<
  C,
  I extends IO<OUT>,
  IN extends CommandInput,
  OUT extends CommandOutput,
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  argv: any
  input?: (ctx: FileSystemCommandContext, input: CommandInput) => Promise<IN>
  io: (ctx: FileSystemCommandContext, logger: TkmLogger) => I
  configRepository: (
    ctx: FileSystemCommandContext,
    logger: TkmLogger,
    credentialManager: CredentialManager,
  ) => Promise<C>
  executor: CommandHandler<C, I, IN, OUT>
}

const promptMfaCode = (mfaSerial: string): Promise<string> =>
  input({
    message: `Enter MFA code for ${mfaSerial}`,
  })

const defaultInputBuilder = async <IN extends CommandInput>(
  ctx: FileSystemCommandContext,
  input: CommandInput,
): Promise<IN> => input as IN

export const handle = async <
  C,
  I extends IO<OUT>,
  IN extends CommandInput,
  OUT extends CommandOutput,
>(
  props: HandleProps<C, I, IN, OUT>,
): Promise<void> => {
  try {
    const ctx = await initCommandContext(props.argv)
    const logger = createLogger({
      writer: console.log,
      logLevel: ctx.logLevel,
    })

    const baseInput = {
      timer: new Timer("total"),
      outputFormat: ctx.outputFormat,
    }

    const { input: inputBuilder = defaultInputBuilder } = props

    const input = await inputBuilder(ctx, baseInput)

    logger.debugObject("Input arguments:", () => input)
    const io = props.io(ctx, logger)

    const credentialManager = await initDefaultCredentialManager(
      promptMfaCode,
      logger,
      ctx.awsClientProvider,
      ctx.credentials,
    )

    const configRepository = await props.configRepository(
      ctx,
      logger,
      credentialManager,
    )

    const startTime = new Date()

    const output = await props.executor({
      ctx,
      configRepository,
      io,
      input,
      credentialManager,
    })

    const credentialManagers = collectFromHierarchy(credentialManager, (cm) =>
      Array.from(cm.children.values()),
    )

    const endTime = new Date()
    await onComplete({
      ctx,
      output,
      credentialManagers,
      startTime,
      endTime,
    })
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
