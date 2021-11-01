import {
  AccountId,
  IamRoleArn,
  makeIamRoleArn,
  OrganizationAccount,
} from "@takomo/aws-model"
import {
  ConfigSetName,
  ConfigSetType,
  getConfigSetsByType,
  StageName,
} from "@takomo/config-sets"
import {
  ConfigSetExecutionGroup,
  ConfigSetExecutionPlan,
  ConfigSetExecutionStage,
  ConfigSetExecutionTarget,
} from "@takomo/execution-plans"
import {
  OrganizationAccountConfig,
  OrganizationalUnitConfig,
} from "@takomo/organization-config"
import {
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { CommandPath } from "@takomo/stacks-model"
import {
  arrayToMap,
  collectFromHierarchy,
  TakomoError,
  TkmLogger,
} from "@takomo/util"
import R from "ramda"

export interface AccountsSelectionCriteria {
  readonly organizationalUnits: ReadonlyArray<OrganizationalUnitPath>
  readonly accountIds: ReadonlyArray<AccountId>
  readonly configSetType: ConfigSetType
  readonly configSetName?: ConfigSetName
  readonly commandPath?: CommandPath
}

export interface CreateAccountsPlanProps {
  readonly ctx: OrganizationContext
  readonly logger: TkmLogger
  readonly organizationState: OrganizationState
  readonly accountsSelectionCriteria: AccountsSelectionCriteria
}

export interface PlannedOrganizationAccount extends OrganizationAccount {
  readonly executionRoleArn: IamRoleArn
  readonly accountId: AccountId
}

export const createAccountsPlan = async ({
  ctx,
  logger,
  organizationState,
  accountsSelectionCriteria,
}: CreateAccountsPlanProps): Promise<
  ConfigSetExecutionPlan<PlannedOrganizationAccount>
> => {
  const { accounts } = organizationState
  const {
    organizationalUnits: selectedOuPaths,
    accountIds,
    configSetType,
    commandPath,
    configSetName,
  } = accountsSelectionCriteria

  logger.debugObject(
    "Create accounts plan with criteria:",
    () => accountsSelectionCriteria,
  )

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

  const rootOu = ctx.getOrganizationalUnit("Root")
  const allOuPaths = collectFromHierarchy(rootOu, (n) => n.children).map(
    (ou) => ou.path,
  )

  selectedOuPaths.forEach((ouPath) => {
    if (!allOuPaths.includes(ouPath)) {
      throw new TakomoError(
        `No organizational unit found with path: '${ouPath}'`,
      )
    }
  })

  const sortOus = (
    a: OrganizationalUnitConfig,
    b: OrganizationalUnitConfig,
  ): number => {
    const order = a.priority - b.priority
    return order !== 0 ? order : a.name.localeCompare(b.name)
  }

  const organizationalUnitsToLaunch =
    selectedOuPaths.length === 0
      ? [rootOu]
      : selectedOuPaths.reduce(
          (collected, path) => [...collected, ctx.getOrganizationalUnit(path)],
          new Array<OrganizationalUnitConfig>(),
        )

  const ousToLaunch: ReadonlyArray<OrganizationalUnitConfig> =
    organizationalUnitsToLaunch
      .map((ou) =>
        collectFromHierarchy(ou, (o) => o.children, {
          sortSiblings: sortOus,
          filter: (o) => o.status === "active",
        }).flat(),
      )
      .flat()

  const uniqueOusToLaunch: ReadonlyArray<OrganizationalUnitConfig> = R.uniqBy(
    R.prop("path"),
    ousToLaunch,
  )

  const accountsById = arrayToMap(accounts, R.prop("id"))

  const getConfigSets = R.curry(getConfigSetsByType)(configSetType)

  const getExecutionRoleArn = (a: OrganizationAccountConfig): IamRoleArn => {
    switch (configSetType) {
      case "bootstrap":
        return makeIamRoleArn(a.id, a.accountBootstrapRoleName)
      case "standard":
        return makeIamRoleArn(a.id, a.accountAdminRoleName)
      default:
        throw new Error(`Unsupported config set type: ${configSetType}`)
    }
  }

  const hasConfigSets = (a: OrganizationAccountConfig) =>
    getConfigSets(a).length > 0

  const getConfigSetsWithStage = (
    a: OrganizationAccountConfig,
    stageName: StageName,
  ) => getConfigSets(a).filter((cs) => cs.stage === stageName)

  const hasConfigSetsWithStage = (
    a: OrganizationAccountConfig,
    stageName: StageName,
  ) => getConfigSetsWithStage(a, stageName).length > 0

  const isActive = ({ status }: OrganizationAccountConfig): boolean =>
    status === "active"

  const isIncludedInSelectedAccountIds = ({
    id,
  }: OrganizationAccountConfig): boolean =>
    accountIds.length === 0 || accountIds.includes(id)

  const configSetNameMatches = (a: OrganizationAccountConfig): boolean =>
    configSetName === undefined ||
    getConfigSets(a).some(({ name }) => name === configSetName)

  const filterAccountsBySelectionCriteria = (
    accounts: ReadonlyArray<OrganizationAccountConfig>,
  ): ReadonlyArray<OrganizationAccountConfig> =>
    accounts.filter(
      (a) =>
        isActive(a) &&
        hasConfigSets(a) &&
        configSetNameMatches(a) &&
        isIncludedInSelectedAccountIds(a),
    )

  const convertToExecutionTarget = (
    a: OrganizationAccountConfig,
    stageName: StageName,
  ): ConfigSetExecutionTarget<PlannedOrganizationAccount> => ({
    id: a.id,
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
      ...accountsById.get(a.id)!,
      executionRoleArn: getExecutionRoleArn(a),
      accountId: a.id,
    },
  })

  const convertToExecutionGroup = (
    ou: OrganizationalUnitConfig,
    stageName: StageName,
  ): ConfigSetExecutionGroup<PlannedOrganizationAccount> => ({
    id: ou.path,
    targets: ou.accounts
      .filter((a) => hasConfigSetsWithStage(a, stageName))
      .map((a) => convertToExecutionTarget(a, stageName))
      .filter((a) => a.configSets.length > 0),
  })

  const ous: ReadonlyArray<OrganizationalUnitConfig> = uniqueOusToLaunch
    .map((ou) => ({
      ...ou,
      accounts: filterAccountsBySelectionCriteria(ou.accounts),
    }))
    .filter((ou) => ou.accounts.length > 0)

  const createStage = (
    stageName: StageName,
  ): ConfigSetExecutionStage<PlannedOrganizationAccount> => ({
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

  logger.traceObject("Accounts plan", plan)

  return plan
}
