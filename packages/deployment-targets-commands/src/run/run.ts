import { CallerIdentity, IamRoleName } from "@takomo/aws-model"
import { CommandRole, resolveCommandOutputBase } from "@takomo/core"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "@takomo/deployment-targets-config"
import { DeploymentTargetsContext } from "@takomo/deployment-targets-context"
import { OperationState } from "@takomo/stacks-model"
import { deepCopy, TakomoError, Timer } from "@takomo/util"
import { exec } from "child_process"
import { IPolicy, Policy } from "cockatiel"
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

export const processDeploymentTarget = async (
  props: RunProps,
  group: DeploymentGroupConfig,
  target: DeploymentTargetConfig,
  timer: Timer,
  state: OperationState,
): Promise<DeploymentTargetRunResult> => {
  const { io, ctx, input } = props

  io.info(`Run deployment target: ${target.name}`)

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

  const env = {
    ...deepCopy(process.env),
    TKM_TARGET: target.name,
  }

  const credentials = await credentialManager.getCredentials()
  env.AWS_ACCESS_KEY_ID = credentials.accessKeyId
  env.AWS_SECRET_ACCESS_KEY = credentials.secretAccessKey
  env.AWS_SESSION_TOKEN = credentials.sessionToken
  env.AWS_SECURITY_TOKEN = credentials.sessionToken

  const cwd = ctx.projectDir

  try {
    const { stdout } = await execP(input.command, { cwd, env })

    timer.stop()
    io.infoText("Command output:", stdout)

    return {
      status: "SUCCESS",
      name: target.name,
      success: true,
      message: "Success",
      timer,
    }
  } catch (e) {
    state.failed = true
    io.infoText("Command output:", e.stdout)
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

  io.info(`Execute deployment group: ${group.path}`)
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
  const { input, plan, listener } = props
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

  childTimer.stop()

  return {
    ...resolveCommandOutputBase(results),
    results,
    timer: childTimer,
  }
}
