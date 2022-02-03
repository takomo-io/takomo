import { Credentials } from "@aws-sdk/types"
import {
  createAwsClientProvider,
  initDefaultCredentialManager,
  InternalCredentialManager,
} from "@takomo/aws-clients"
import { formatCommandStatus } from "@takomo/cli-io"
import {
  createFileSystemCommandContext,
  FileSystemCommandContext,
} from "@takomo/config-repository-fs"
import {
  CommandHandler,
  CommandInput,
  CommandOutput,
  InternalCommandContext,
  IO,
  parseBoolean,
  parseStringArray,
} from "@takomo/core"
import {
  collectFromHierarchy,
  createLogger,
  createTimer,
  expandFilePath,
  FilePath,
  formatElapsedMillis,
  indentLines,
  printTimer,
  red,
  TkmLogger,
} from "@takomo/util"
import Table from "easy-table"
import inquirer from "inquirer"
import os from "os"
import R from "ramda"
import { Arguments } from "yargs"
import { parseFeaturesFromArgs } from "./options/parse-features-from-args"
import { parseLogLevel } from "./options/parse-log-level"
import { parseOutputFormat } from "./options/parse-output-format"
import { parseVarArgs } from "./options/parse-var-args"
import { parseVarFileOptions } from "./options/parse-var-file-options"

export interface RunProps {
  readonly overridingHandler?: (args: Arguments) => void
  readonly showHelpOnFail?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require("../package.json")

const resolveProjectDir = (projectDirArg: any): FilePath => {
  if (projectDirArg) {
    const projectDir = projectDirArg.toString()
    return expandFilePath(process.cwd(), projectDir)
  }

  return process.cwd()
}

export const initCommandContext = async (
  argv: any,
  credentials?: Credentials,
): Promise<FileSystemCommandContext> => {
  if (argv.profile) {
    process.env.AWS_PROFILE = argv.profile
  }

  if (argv["load-aws-sdk-config"]) {
    process.env.AWS_SDK_LOAD_CONFIG = "true"
  }

  const buildInfo = {
    version,
  }

  const statisticsEnabled = parseBoolean(argv.stats, false)
  const autoConfirmEnabled = parseBoolean(argv.yes, false)
  const quiet = parseBoolean(argv.quiet, false)
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

  logger.debug(`Takomo v${version}`)

  return createFileSystemCommandContext({
    quiet,
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

    const apiCallsByClient = R.groupBy(R.prop("clientId"), allApiCalls)
    const clientIds = Object.keys(apiCallsByClient).sort()
    clientIds.forEach((clientId) => {
      clientsTable.cell("Client id", clientId).newRow()
      const clientApiCalls = apiCallsByClient[clientId]
      const clientApiCallsByAction = R.groupBy(
        (a) => `${a.api}:${a.action}`,
        clientApiCalls,
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

    const totalApiCallsByAction = R.groupBy(
      (a) => `${a.api}:${a.action}`,
      allApiCalls,
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

  if (output.outputFormat === "text") {
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
  argv: any
  input?: (ctx: FileSystemCommandContext, input: CommandInput) => Promise<IN>
  io: (ctx: FileSystemCommandContext, logger: TkmLogger) => I
  configRepository: (
    ctx: FileSystemCommandContext,
    logger: TkmLogger,
  ) => Promise<C>
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
      timer: createTimer("total"),
      outputFormat: ctx.outputFormat,
    }

    const { input: inputBuilder = defaultInputBuilder } = props

    const input = await inputBuilder(ctx, baseInput)

    logger.debugObject("Input arguments:", () => input)
    const io = props.io(ctx, logger)

    const configRepository = await props.configRepository(ctx, logger)
    const credentialManager = await initDefaultCredentialManager(
      promptMfaCode,
      logger,
      ctx.awsClientProvider,
      ctx.credentials,
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
