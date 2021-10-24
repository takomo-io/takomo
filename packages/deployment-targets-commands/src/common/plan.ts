import { AccountId, IamRoleArn, makeIamRoleArn } from "@takomo/aws-model"
import {
  ConfigSetName,
  ConfigSetType,
  ExecutionGroup,
  ExecutionPlan,
  ExecutionStage,
  ExecutionTarget,
  StageName,
} from "@takomo/config-sets"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "@takomo/deployment-targets-config"
import { DeploymentTargetsContext } from "@takomo/deployment-targets-context"
import {
  DeploymentGroupPath,
  DeploymentTargetNamePattern,
  Label,
} from "@takomo/deployment-targets-model"
import { CommandPath } from "@takomo/stacks-model"
import { collectFromHierarchy, TakomoError, TkmLogger } from "@takomo/util"
import R from "ramda"

type Matcher = (targetName: DeploymentTargetConfig) => boolean

export const createDeploymentTargetNamePatternMatcher = (
  pattern: DeploymentTargetNamePattern,
): Matcher => {
  const prefix = pattern.endsWith("%")
  const suffix = pattern.startsWith("%")
  if (prefix && suffix) {
    const part = pattern.slice(1, -1)
    return ({ name }) => name.includes(part)
  }
  if (prefix) {
    const part = pattern.slice(0, -1)
    return ({ name }) => name.startsWith(part)
  }
  if (suffix) {
    const part = pattern.slice(1)
    return ({ name }) => name.endsWith(part)
  }
  return ({ name }) => name === pattern
}

export interface TargetsSelectionCriteria {
  readonly groups: ReadonlyArray<DeploymentGroupPath>
  readonly targets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly excludeTargets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly labels: ReadonlyArray<Label>
  readonly excludeLabels: ReadonlyArray<Label>
  readonly configSetType: ConfigSetType
  readonly configSetName?: ConfigSetName
  readonly commandPath?: CommandPath
}

export interface CreateDeploymentPlanProps {
  readonly ctx: DeploymentTargetsContext
  readonly logger: TkmLogger
  readonly targetsSelectionCriteria: TargetsSelectionCriteria
}

export interface PlannedDeploymentTarget extends DeploymentTargetConfig {
  readonly executionRoleArn?: IamRoleArn
  readonly accountId?: AccountId
}

export const createDeploymentPlan = async ({
  ctx,
  logger,
  targetsSelectionCriteria,
}: CreateDeploymentPlanProps): Promise<
  ExecutionPlan<PlannedDeploymentTarget>
> => {
  const {
    configSetName,
    commandPath,
    configSetType,
    groups,
    targets,
    excludeTargets,
    labels,
    excludeLabels,
  } = targetsSelectionCriteria

  logger.debugObject(
    "Create deployment plan with criteria:",
    () => targetsSelectionCriteria,
  )

  if (groups.length > 0) {
    groups.forEach((groupPath) => {
      if (!ctx.hasDeploymentGroup(groupPath)) {
        throw new TakomoError(`Deployment group '${groupPath}' not found`)
      }
    })
  }

  if (commandPath && !configSetName) {
    throw new TakomoError(
      "If you provide command path, you must provide config set, too",
    )
  }

  if (configSetName) {
    if (!ctx.hasConfigSet(configSetName)) {
      throw new TakomoError(`Config set '${configSetName}' not found`)
    }
  }

  const callerIdentity = await ctx.credentialManager.getCallerIdentity()

  const deploymentGroupsToLaunch =
    groups.length === 0
      ? ctx.rootDeploymentGroups
      : groups.reduce((collected, path) => {
          return [...collected, ctx.getDeploymentGroup(path)]
        }, new Array<DeploymentGroupConfig>())

  const sortGroups = (
    a: DeploymentGroupConfig,
    b: DeploymentGroupConfig,
  ): number => {
    const order = a.priority - b.priority
    return order !== 0 ? order : a.name.localeCompare(b.name)
  }

  const groupsToLaunch: DeploymentGroupConfig[] = deploymentGroupsToLaunch
    .map((ou) =>
      collectFromHierarchy(ou, (o) => o.children, {
        sortSiblings: sortGroups,
        filter: (o) => o.status === "active",
      }),
    )
    .flat()

  const uniqueGroupsToLaunch = R.uniqBy(R.prop("path"), groupsToLaunch).filter(
    (o) => o.status === "active",
  )

  const getConfigSets = (a: DeploymentTargetConfig) => {
    switch (configSetType) {
      case "bootstrap":
        return a.bootstrapConfigSets
      case "standard":
        return a.configSets
      default:
        throw new Error(`Unsupported config set type: ${configSetType}`)
    }
  }

  const hasConfigSets = (a: DeploymentTargetConfig) =>
    getConfigSets(a).length > 0

  const isActive = ({ status }: DeploymentTargetConfig): boolean =>
    status === "active"

  const configSetNameMatches = (a: DeploymentTargetConfig): boolean => {
    if (configSetName === undefined) {
      return true
    }
    switch (configSetType) {
      case "standard":
        return a.configSets.some(({ name }) => name === configSetName)
      case "bootstrap":
        return a.bootstrapConfigSets.some(({ name }) => name === configSetName)
      default:
        throw new Error(`Unsupported config set type: ${configSetType}`)
    }
  }

  const isIncludedInSelectedTargets = ({
    name,
  }: DeploymentTargetConfig): boolean =>
    targets.length === 0 || targets.includes(name)

  const targetNameMatchers = targets.map(
    createDeploymentTargetNamePatternMatcher,
  )

  const excludeTargetNameMatchers = excludeTargets.map(
    createDeploymentTargetNamePatternMatcher,
  )

  const targetNameMatches = (target: DeploymentTargetConfig): boolean =>
    (targetNameMatchers.length === 0 ||
      targetNameMatchers.some((m) => m(target))) &&
    (excludeTargetNameMatchers.length === 0 ||
      !excludeTargetNameMatchers.some((m) => m(target)))

  const labelMatches = (target: DeploymentTargetConfig): boolean =>
    (labels.length === 0 || target.labels.some((l) => labels.includes(l))) &&
    (excludeLabels.length === 0 ||
      !target.labels.some((l) => excludeLabels.includes(l)))

  const filterTargetsBySelectionCriteria = (
    targets: ReadonlyArray<DeploymentTargetConfig>,
  ): ReadonlyArray<DeploymentTargetConfig> =>
    targets.filter(
      (a) =>
        isActive(a) &&
        hasConfigSets(a) &&
        configSetNameMatches(a) &&
        isIncludedInSelectedTargets(a) &&
        targetNameMatches(a) &&
        labelMatches(a),
    )

  const getConfigSetsWithStage = (
    a: DeploymentTargetConfig,
    stageName: StageName,
  ) => getConfigSets(a).filter((cs) => cs.stage === stageName)

  const hasConfigSetsWithStage = (
    a: DeploymentTargetConfig,
    stageName: StageName,
  ) => getConfigSetsWithStage(a, stageName).length > 0

  const getExecutionRoleArn = (
    a: DeploymentTargetConfig,
  ): IamRoleArn | undefined => {
    const accountId = a.accountId ?? callerIdentity.accountId
    switch (configSetType) {
      case "bootstrap":
        if (a.bootstrapRole) {
          return a.bootstrapRole.iamRoleArn
        }
        if (a.bootstrapRoleName) {
          return makeIamRoleArn(accountId, a.bootstrapRoleName)
        }
        return undefined
      case "standard":
        if (a.deploymentRole) {
          return a.deploymentRole.iamRoleArn
        }
        if (a.deploymentRoleName) {
          return makeIamRoleArn(accountId, a.deploymentRoleName)
        }

        return undefined
      default:
        throw new Error(`Unsupported config set type: ${configSetType}`)
    }
  }

  const ous: ReadonlyArray<DeploymentGroupConfig> = uniqueGroupsToLaunch
    .map((ou) => ({
      ...ou,
      targets: filterTargetsBySelectionCriteria(ou.targets),
    }))
    .filter((ou) => ou.targets.length > 0)

  const convertToExecutionTarget = (
    a: DeploymentTargetConfig,
    stageName: StageName,
  ): ExecutionTarget<PlannedDeploymentTarget> => ({
    id: a.name,
    vars: a.vars,
    configSets: getConfigSetsWithStage(a, stageName)
      .map((cs) => cs.name)
      .filter((csName) => !configSetName || csName === configSetName)
      .map((csName) => ctx.getConfigSet(csName))
      .map((cs) => ({
        name: cs.name,
        commandPaths: commandPath ? [commandPath] : cs.commandPaths,
      })),
    data: {
      ...a,
      executionRoleArn: getExecutionRoleArn(a),
      accountId: a.accountId,
    },
  })

  const convertToExecutionGroup = (
    ou: DeploymentGroupConfig,
    stageName: StageName,
  ): ExecutionGroup<PlannedDeploymentTarget> => ({
    path: ou.path,
    targets: ou.targets
      .filter((a) => hasConfigSetsWithStage(a, stageName))
      .map((a) => convertToExecutionTarget(a, stageName))
      .filter((a) => a.configSets.length > 0),
  })

  const createStage = (
    stageName: StageName,
  ): ExecutionStage<PlannedDeploymentTarget> => ({
    stageName,
    groups: ous
      .map((ou) => convertToExecutionGroup(ou, stageName))
      .filter((group) => group.targets.length > 0),
  })

  const stages = ctx
    .getStages()
    .map(createStage)
    .filter((s) => s.groups.length > 0)

  const plan = {
    stages,
    configSetType,
  }

  logger.traceObject("Deployment plan", plan)

  return plan
}
