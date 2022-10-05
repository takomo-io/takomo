import { Credentials } from "@aws-sdk/types"
import { exec } from "child_process"
import { IPolicy, Policy } from "cockatiel"
import { extname } from "path"
import R from "ramda"
import { promisify } from "util"
import {
  CredentialManager,
  prepareAwsEnvVariables,
} from "../../takomo-aws-clients"
import { CallerIdentity, IamRoleArn, IamRoleName } from "../../takomo-aws-model"
import {
  CommandRole,
  CommandStatus,
  OperationState,
  resolveCommandOutputBase,
} from "../../takomo-core"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "../../takomo-deployment-targets-config"
import { DeploymentTargetsContext } from "../../takomo-deployment-targets-context"
import {
  expandFilePath,
  FilePath,
  parseYaml,
  readFileContents,
  Timer,
  TkmLogger,
} from "../../takomo-util"
import { DeploymentTargetsListener } from "../operation/model"
import {
  DeploymentGroupRunResult,
  DeploymentTargetRunResult,
  DeploymentTargetsRunInput,
  DeploymentTargetsRunIO,
  DeploymentTargetsRunOutput,
  TargetsRunPlan,
} from "./model"

const execP = promisify(exec)

type DeploymentTargetRunOperation = () => Promise<DeploymentTargetRunResult>

const getDeploymentRole = (
  currentIdentity: CallerIdentity,
  group: DeploymentGroupConfig,
  target: DeploymentTargetConfig,
  disableMapRole: boolean,
  roleName?: IamRoleName,
): CommandRole | undefined => {
  if (disableMapRole) {
    return undefined
  }

  const deploymentRole = target.deploymentRole ?? group.deploymentRole
  if (deploymentRole) {
    return deploymentRole
  }

  const deploymentRoleName =
    roleName ?? target.deploymentRoleName ?? group.deploymentRoleName
  if (!deploymentRoleName) {
    return undefined
  }

  const deploymentAccountId = target.accountId ?? currentIdentity.accountId

  return {
    iamRoleArn: `arn:aws:iam::${deploymentAccountId}:role/${deploymentRoleName}`,
  }
}

const captureValue = (
  {
    captureAfterLine,
    captureLastLine,
    captureBeforeLine,
  }: DeploymentTargetsRunInput,
  output: string,
): string => {
  const lines = output.trim().split("\n")

  if (captureLastLine) {
    return (R.last(lines) ?? "") + "\n"
  }

  if (!captureAfterLine && !captureBeforeLine) {
    return output
  }

  const start = captureAfterLine
    ? lines.findIndex((item) => item === captureAfterLine)
    : -1

  const end = captureBeforeLine
    ? lines.findIndex((item) => item === captureBeforeLine)
    : -1

  const endLineNumber = end === -1 ? lines.length : end

  return lines
    .slice(start + 1, endLineNumber)
    .map((l) => `${l}\n`)
    .join("")
}

interface RunMapCommandProps {
  readonly ctx: DeploymentTargetsContext
  readonly group: DeploymentGroupConfig
  readonly target: DeploymentTargetConfig
  readonly logger: TkmLogger
  readonly credentials: Credentials
  readonly mapCommand: string
  readonly input: DeploymentTargetsRunInput
  readonly mapArgs: unknown
}

const runJsMapFunction = async ({
  ctx,
  mapCommand,
  group,
  target,
  logger,
  credentials,
  mapArgs,
}: RunMapCommandProps): Promise<unknown> => {
  const mapFunctionFullPath = expandFilePath(ctx.projectDir, mapCommand)
  logger.debug(`Run map function from file: ${mapFunctionFullPath}`)

  // eslint-disable-next-line
  const mapperFn = require(mapFunctionFullPath)

  return mapperFn({
    credentials,
    target: target,
    deploymentGroupPath: group.path,
    args: mapArgs,
  })
}

const runMapProcessCommand = async ({
  ctx,
  mapCommand,
  group,
  target,
  logger,
  credentials,
  input,
  mapArgs,
}: RunMapCommandProps): Promise<unknown> => {
  logger.debug(`Run map command: ${mapCommand}`)

  const targetJson = JSON.stringify(target)
  const additionalVariables = {
    TKM_TARGET_NAME: target.name,
    TKM_TARGET_JSON: targetJson,
    TKM_DEPLOYMENT_GROUP_PATH: group.path,
    TKM_MAP_ARGS: "",
  }

  if (mapArgs) {
    additionalVariables.TKM_MAP_ARGS =
      typeof mapArgs === "string" ? mapArgs : JSON.stringify(mapArgs)
  }

  const env = prepareAwsEnvVariables({
    env: process.env,
    credentials,
    additionalVariables,
  })

  const { stdout } = await execP(mapCommand, {
    env,
    cwd: ctx.projectDir,
  })

  return captureValue(input, stdout)
}

const runMapCommand = (props: RunMapCommandProps): Promise<unknown> =>
  props.mapCommand.startsWith("js:")
    ? runJsMapFunction({ ...props, mapCommand: props.mapCommand.substr(3) })
    : runMapProcessCommand(props)

interface RunReduceCommandProps {
  readonly reduceCommand: string
  readonly ctx: DeploymentTargetsContext
  readonly credentials: Credentials
  readonly targetResults: ReadonlyArray<unknown>
}

const runReduceProcessCommand = async ({
  credentials,
  ctx,
  reduceCommand,
  targetResults,
}: RunReduceCommandProps): Promise<unknown> => {
  const additionalVariables = {
    TKM_TARGET_RESULTS_JSON: JSON.stringify(targetResults),
  }

  const env = prepareAwsEnvVariables({
    env: process.env,
    credentials,
    additionalVariables,
  })

  const { stdout } = await execP(reduceCommand, {
    env,
    cwd: ctx.projectDir,
  })

  return stdout
}

const runJsReduceFunction = ({
  credentials,
  ctx,
  reduceCommand,
  targetResults,
}: RunReduceCommandProps): Promise<unknown> => {
  const fullReduceFunctionPath = expandFilePath(ctx.projectDir, reduceCommand)

  // eslint-disable-next-line
  const reduceFn = require(fullReduceFunctionPath)

  return reduceFn({
    credentials,
    targets: targetResults,
  })
}

const runReduceCommand = async (
  props: RunReduceCommandProps,
): Promise<unknown> =>
  props.reduceCommand.startsWith("js:")
    ? runJsReduceFunction({
        ...props,
        reduceCommand: props.reduceCommand.substr(3),
      })
    : runReduceProcessCommand(props)

const getCredentialManager = async (
  ctx: DeploymentTargetsContext,
  deploymentRole?: CommandRole,
): Promise<CredentialManager> =>
  deploymentRole
    ? await ctx.credentialManager.createCredentialManagerForRole(
        deploymentRole.iamRoleArn,
      )
    : ctx.credentialManager

const getCredentialsForMapCommand = async (
  { ctx, input: { mapRoleName, disableMapRole } }: RunProps,
  group: DeploymentGroupConfig,
  target: DeploymentTargetConfig,
): Promise<Credentials> =>
  ctx.credentialManager
    .getCallerIdentity()
    .then((currentIdentity) =>
      getDeploymentRole(
        currentIdentity,
        group,
        target,
        disableMapRole,
        mapRoleName,
      ),
    )
    .then((deploymentRole) => getCredentialManager(ctx, deploymentRole))
    .then((c) => c.getCredentials())

const getCredentialsForReduceCommand = async (
  ctx: DeploymentTargetsContext,
  reduceRoleArn?: IamRoleArn,
): Promise<Credentials> => {
  const credentialManager = reduceRoleArn
    ? await ctx.credentialManager.createCredentialManagerForRole(reduceRoleArn)
    : ctx.credentialManager

  return await credentialManager.getCredentials()
}

export const processDeploymentTarget = async (
  props: RunProps,
  group: DeploymentGroupConfig,
  target: DeploymentTargetConfig,
  timer: Timer,
  state: OperationState,
  logger: TkmLogger,
  mapArgs: unknown,
): Promise<DeploymentTargetRunResult> => {
  const { ctx, input } = props
  const { mapCommand } = input

  if (state.failed) {
    timer.stop()
    return {
      message: "Cancelled",
      status: "CANCELLED",
      success: false,
      name: target.name,
      timer,
    }
  }

  logger.info("Start run")

  try {
    const credentials = await getCredentialsForMapCommand(props, group, target)

    const value = await runMapCommand({
      mapCommand,
      ctx,
      logger,
      target,
      group,
      credentials,
      input,
      mapArgs,
    })
    timer.stop()
    return {
      status: "SUCCESS" as CommandStatus,
      name: target.name,
      success: true,
      message: "Success",
      value,
      timer,
    }
  } catch (error: any) {
    timer.stop()
    logger.error(`Map command failed for target '${target.name}'`, error)
    return {
      status: "FAILED" as CommandStatus,
      name: target.name,
      success: false,
      message: "Error",
      error,
      timer,
    }
  }
}

const convertToOperation =
  (
    props: RunProps,
    group: DeploymentGroupConfig,
    timer: Timer,
    state: OperationState,
    target: DeploymentTargetConfig,
    results: Array<DeploymentTargetRunResult>,
    policy: IPolicy,
    listener: DeploymentTargetsListener,
    mapArgs: unknown,
  ): DeploymentTargetRunOperation =>
  () =>
    policy.execute(async () => {
      await listener.onTargetBegin()
      const result = await processDeploymentTarget(
        props,
        group,
        target,
        timer.startChild(target.name),
        state,
        props.io.childLogger(target.name),
        mapArgs,
      )
      results.push(result)
      await listener.onTargetComplete()
      return result
    })

export const processDeploymentGroup = async (
  props: RunProps,
  group: DeploymentGroupConfig,
  timer: Timer,
  state: OperationState,
  listener: DeploymentTargetsListener,
  mapArgs: unknown,
): Promise<DeploymentGroupRunResult> => {
  const { io, input } = props

  const { concurrentTargets } = input

  io.info(`Run deployment group: ${group.path}`)
  const results = new Array<DeploymentTargetRunResult>()

  const deploymentPolicy = Policy.bulkhead(concurrentTargets, 10000)

  const operations = group.targets.map((target) =>
    convertToOperation(
      props,
      group,
      timer,
      state,
      target,
      results,
      deploymentPolicy,
      listener,
      mapArgs,
    ),
  )

  await Promise.all(operations.map((o) => o()))

  timer.stop()

  return {
    ...resolveCommandOutputBase(results),
    results,
    path: group.path,
    timer,
  }
}

interface RunProps {
  readonly ctx: DeploymentTargetsContext
  readonly input: DeploymentTargetsRunInput
  readonly io: DeploymentTargetsRunIO
  readonly plan: TargetsRunPlan
  readonly listener: DeploymentTargetsListener
}

const convertArgs = async (
  projectDir: FilePath,
  args?: string,
): Promise<unknown> => {
  if (!args) {
    return undefined
  }

  if (args.startsWith("file:")) {
    const filePath = args.substr(5)
    const fullFilePath = expandFilePath(projectDir, filePath)
    const contents = await readFileContents(fullFilePath)
    switch (extname(filePath)) {
      case ".json":
        return JSON.parse(contents)
      case ".yml":
      case ".yaml":
        return parseYaml(fullFilePath, contents)
      default:
        return contents
    }
  }

  return args
}

export const run = async (
  props: RunProps,
): Promise<DeploymentTargetsRunOutput> => {
  const { input, plan, listener, ctx, io } = props
  const childTimer = input.timer.startChild("run")

  const results = new Array<DeploymentGroupRunResult>()

  const mapArgs = await convertArgs(ctx.projectDir, input.mapArgs)

  const state = { failed: false }

  for (const group of plan.groups) {
    const result = await processDeploymentGroup(
      props,
      group,
      childTimer.startChild(group.name),
      state,
      listener,
      mapArgs,
    )
    results.push(result)
  }

  const outputBase = resolveCommandOutputBase(results)

  const targetResults = results
    .map((r) => r.results)
    .flat()
    .map((r) => r.value)

  if (!outputBase.success || !input.reduceCommand) {
    childTimer.stop()
    return {
      ...outputBase,
      result: targetResults,
      timer: childTimer,
      outputFormat: input.outputFormat,
    }
  }

  const reduceCredentials = await getCredentialsForReduceCommand(
    ctx,
    input.reduceRoleArn,
  )

  try {
    const result = await runReduceCommand({
      targetResults,
      ctx,
      credentials: reduceCredentials,
      reduceCommand: input.reduceCommand,
    })
    childTimer.stop()
    return {
      ...outputBase,
      result,
      timer: childTimer,
      outputFormat: input.outputFormat,
    }
  } catch (error: any) {
    childTimer.stop()
    io.error(`Reduce command failed`, error)
    return {
      error,
      result: undefined,
      message: "Reduce command failed",
      success: false,
      status: "FAILED",
      timer: childTimer,
      outputFormat: input.outputFormat,
    }
  }
}
