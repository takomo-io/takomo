import { CallerIdentity, IamRoleName } from "@takomo/aws-model"
import { CommandRole, resolveCommandOutputBase } from "@takomo/core"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "@takomo/deployment-targets-config"
import { DeploymentTargetsContext } from "@takomo/deployment-targets-context"
import { OperationState } from "@takomo/stacks-model"
import {
  deepCopy,
  expandFilePath,
  TakomoError,
  Timer,
  TkmLogger,
} from "@takomo/util"
import { exec } from "child_process"
import { IPolicy, Policy } from "cockatiel"
import R from "ramda"
import { promisify } from "util"
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
  roleName?: IamRoleName,
): CommandRole | undefined => {
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

export const processDeploymentTarget = async (
  props: RunProps,
  group: DeploymentGroupConfig,
  target: DeploymentTargetConfig,
  timer: Timer,
  state: OperationState,
  logger: TkmLogger,
): Promise<DeploymentTargetRunResult> => {
  const { ctx, input } = props

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

  const currentIdentity = await ctx.credentialManager.getCallerIdentity()
  const deploymentRole = getDeploymentRole(
    currentIdentity,
    group,
    target,
    input.roleName,
  )

  const credentialManager = deploymentRole
    ? await ctx.credentialManager.createCredentialManagerForRole(
        deploymentRole.iamRoleArn,
      )
    : ctx.credentialManager

  if (target.accountId) {
    const identity = await credentialManager.getCallerIdentity()
    if (identity.accountId !== target.accountId) {
      throw new TakomoError(
        `Current credentials belong to AWS account ${identity.accountId}, but the deployment target can be run only against account: ${target.accountId}`,
      )
    }
  }

  const credentials = await credentialManager.getCredentials()
  const cwd = ctx.projectDir

  try {
    if (input.mapCommand.startsWith("js:")) {
      const mapFunctionPath = input.mapCommand.substr(3)
      const mapFunctionFullPath = expandFilePath(
        ctx.projectDir,
        mapFunctionPath,
      )
      logger.debug(`Run map function from file: ${mapFunctionFullPath}`)

      // eslint-disable-next-line
      const mapperFn = require(mapFunctionFullPath)

      const value = await mapperFn({
        credentials,
        target: target.name,
        group: group.path,
        accountId: target.accountId,
      })

      timer.stop()

      return {
        status: "SUCCESS",
        name: target.name,
        success: true,
        message: "Success",
        value,
        timer,
      }
    } else {
      const env = {
        ...deepCopy(process.env),
        TKM_TARGET: target.name,
        TKM_GROUP: group.path,
        AWS_ACCESS_KEY_ID: credentials.accessKeyId,
        AWS_SECRET_ACCESS_KEY: credentials.secretAccessKey,
        AWS_SESSION_TOKEN: credentials.sessionToken,
        AWS_SECURITY_TOKEN: credentials.sessionToken,
      }

      logger.debug(`Run map command: ${input.mapCommand}`)
      const { stdout } = await execP(input.mapCommand, { cwd, env })
      logger.debugText("Map command full output:", () => stdout)
      const value = captureValue(input, stdout)
      logger.debugText("Captured command output:", () => value)

      timer.stop()

      return {
        status: "SUCCESS",
        name: target.name,
        success: true,
        message: "Success",
        value,
        timer,
      }
    }

    throw new Error("No handler")
  } catch (e) {
    state.failed = true
    logger.error(
      `An error occurred while running map command for target ${target.name}`,
    )
    logger.infoText("Command stdout:", e.stdout)
    logger.infoText("Command stderr:", e.stderr)
    timer.stop()
    return {
      status: "FAILED",
      name: target.name,
      success: false,
      message: "Error",
      error: e,
      timer,
    }
  }
}

const convertToOperation = (
  props: RunProps,
  group: DeploymentGroupConfig,
  timer: Timer,
  state: OperationState,
  target: DeploymentTargetConfig,
  results: Array<DeploymentTargetRunResult>,
  policy: IPolicy,
  listener: DeploymentTargetsListener,
): DeploymentTargetRunOperation => () =>
  policy.execute(async () => {
    await listener.onTargetBegin()
    const result = await processDeploymentTarget(
      props,
      group,
      target,
      timer.startChild(target.name),
      state,
      props.io.childLogger(target.name),
    )
    results.push(result)
    await listener.onTargetComplete()
    return result
  })

/**
 * @hidden
 */
export const processDeploymentGroup = async (
  props: RunProps,
  group: DeploymentGroupConfig,
  timer: Timer,
  state: OperationState,
  listener: DeploymentTargetsListener,
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

export const run = async (
  props: RunProps,
): Promise<DeploymentTargetsRunOutput> => {
  const { input, plan, listener, ctx } = props
  const childTimer = input.timer.startChild("run")
  const results = new Array<DeploymentGroupRunResult>()

  const state = { failed: false }

  for (const group of plan.groups) {
    const result = await processDeploymentGroup(
      props,
      group,
      childTimer.startChild(group.name),
      state,
      listener,
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

  if (input.reduceCommand.startsWith("js:")) {
    const reduceFunctionPath = input.reduceCommand.substr(3)
    const fullReduceFunctionPath = expandFilePath(
      ctx.projectDir,
      reduceFunctionPath,
    )

    // eslint-disable-next-line
    const reduceFn = require(fullReduceFunctionPath)

    try {
      const result = await reduceFn(targetResults)
      childTimer.stop()
      return {
        ...outputBase,
        result,
        timer: childTimer,
        outputFormat: input.outputFormat,
      }
    } catch (error) {
      childTimer.stop()
      return {
        error,
        result: error,
        message: "Reduce command failed",
        success: false,
        status: "FAILED",
        timer: childTimer,
        outputFormat: input.outputFormat,
      }
    }
  } else {
    const env = {
      ...deepCopy(process.env),
    }

    const cwd = ctx.projectDir

    return new Promise((resolve) => {
      const child = exec(
        input.reduceCommand!,
        { cwd, env },
        (error, stdout) => {
          childTimer.stop()
          if (error) {
            resolve({
              error,
              result: error,
              message: "Reduce command failed",
              success: false,
              status: "FAILED",
              timer: childTimer,
              outputFormat: input.outputFormat,
            })
          } else {
            resolve({
              ...outputBase,
              result: stdout,
              timer: childTimer,
              outputFormat: input.outputFormat,
            })
          }
        },
      )

      targetResults.forEach((r) => {
        child.stdin?.write(`${r}`)
      })

      child.stdin?.end()
    })
  }
}
