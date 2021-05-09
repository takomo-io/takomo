import {
  ConfirmOrganizationDeployProps,
  DeployOrganizationIO,
  DeployOrganizationOutput,
  OrganizationalUnitsDeploymentPlan,
  OrganizationBasicConfigDeploymentPlan,
  OrgEntityPolicyOperationsPlan,
  PolicyDeploymentPlan,
} from "@takomo/organization-commands"
import { OrganizationState } from "@takomo/organization-context"
import {
  OrganizationHierarchyState,
  PoliciesState,
} from "@takomo/organization-model"
import {
  collectFromHierarchy,
  diffStrings,
  formatYaml,
  green,
  grey,
  red,
  yellow,
} from "@takomo/util"
import Table from "easy-table"
import { createBaseIO } from "../cli-io"
import { printError } from "../common"
import { formatCommandStatus } from "../formatters"
import { IOProps } from "../stacks/common"

const buildOrganizationHierarchyStateFromPlan = (
  plan: OrganizationalUnitsDeploymentPlan,
): OrganizationHierarchyState => {
  const ous = collectFromHierarchy(plan.root, (node) => node.children)

  const collectPolicies = (
    policyPlan: OrgEntityPolicyOperationsPlan,
  ): PoliciesState | undefined => {
    const inherited = [
      ...policyPlan.inherited.add,
      ...policyPlan.inherited.retain,
    ].sort()
    const attached = [
      ...policyPlan.attached.add,
      ...policyPlan.attached.retain,
    ].sort()
    if (inherited.length > 0 || attached.length > 0) {
      return {
        inherited: inherited.length > 0 ? inherited : undefined,
        attached: attached.length > 0 ? attached : undefined,
      }
    }

    return undefined
  }

  return ous
    .filter((ou) => ou.operation !== "delete")
    .reduce((collected, ou) => {
      const accountsList = [...ou.accounts.add, ...ou.accounts.retain]
      const accounts =
        accountsList.length > 0
          ? accountsList.reduce(
              (collectedAccounts, account) => ({
                ...collectedAccounts,
                [`${account.name} (${account.id})`]: {
                  serviceControlPolicies: collectPolicies(
                    account.policies.serviceControl,
                  ),
                  tagPolicies: collectPolicies(account.policies.tag),
                  backupPolicies: collectPolicies(account.policies.backup),
                  aiServicesOptOutPolicies: collectPolicies(
                    account.policies.aiServicesOptOut,
                  ),
                },
              }),
              {},
            )
          : undefined

      return {
        ...collected,
        [ou.path]: {
          accounts,
          serviceControlPolicies: collectPolicies(ou.policies.serviceControl),
          tagPolicies: collectPolicies(ou.policies.tag),
          backupPolicies: collectPolicies(ou.policies.backup),
          aiServicesOptOutPolicies: collectPolicies(
            ou.policies.aiServicesOptOut,
          ),
        },
      }
    }, {})
}

export const createDeployOrganizationIO = (
  props: IOProps,
): DeployOrganizationIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printEnabledPolicyTypesPlan = (
    plan: OrganizationBasicConfigDeploymentPlan,
  ): void => {
    const { add, remove } = plan.enabledPolicies
    if (add.length + remove.length === 0) {
      return
    }

    io.subheader({ text: "Policy types", marginTop: true })

    if (add.length > 0) {
      io.message({
        text: `The following ${add.length} policy types(s) will be enabled:`,
        marginTop: false,
        marginBottom: true,
      })
      add.forEach((s) => {
        io.message({ text: green(`  - ${s}`) })
      })
    }

    if (remove.length > 0) {
      io.message({
        text: `The following ${remove.length} policy types(s) will be disabled:`,
        marginTop: false,
        marginBottom: true,
      })
      remove.forEach((s) => {
        io.message({ text: red(`  - ${s}`) })
      })
    }
  }

  const printPoliciesDeploymentPlan = (plan: PolicyDeploymentPlan): void => {
    if (!plan.hasChanges) {
      return
    }

    io.subheader({ text: "Policies", marginTop: true })

    const { serviceControl, tag, aiServicesOptOut, backup } = plan
    const allPolicies = [serviceControl, tag, aiServicesOptOut, backup]
    const policiesToRemove = allPolicies
      .map((p) => p.remove)
      .flat()
      .map((policy) => ({ policy, operation: "remove" }))
    const policiesToAdd = allPolicies
      .map((p) => p.add)
      .flat()
      .map((policy) => ({ policy, operation: "add" }))
    const policiesToUpdate = allPolicies
      .map((p) => p.update)
      .flat()
      .map((policy) => ({ policy, operation: "update" }))

    const policyOperations = [
      ...policiesToAdd,
      ...policiesToUpdate,
      ...policiesToRemove,
    ]

    io.message({
      text: `The following ${policyOperations.length} policies will be changed:`,
    })

    policyOperations.forEach(({ operation, policy }) => {
      switch (operation) {
        case "add":
          io.message({
            text: `+ ${policy.name}: (policy will be added)`,
            marginTop: true,
            indent: 2,
            transform: green,
          })
          break
        case "remove":
          io.message({
            text: `- ${policy.name}: (policy will be removed)`,
            marginTop: true,
            indent: 2,
            transform: red,
          })
          break
        case "update":
          io.message({
            text: `~ ${policy.name}: (policy will be updated)`,
            marginTop: true,
            indent: 2,
            transform: yellow,
          })
          break
        default:
          throw new Error(`Unsupported policy operation: '${operation}'`)
      }

      io.message({ text: `type:      ${policy.type}`, indent: 6 })
      io.message({
        text: `id:        ${policy.id ?? grey("<known after deploy>")}`,
        indent: 6,
      })
    })
  }

  const printOrganizationalUnitsDeploymentPlan = (
    plan: OrganizationalUnitsDeploymentPlan,
    organizationState: OrganizationState,
  ): void => {
    if (!plan.hasChanges) {
      return
    }

    const currentState = organizationState.toOrganizationHierarchyState()
    const newState = buildOrganizationHierarchyStateFromPlan(plan)

    const currentStateYaml = formatYaml(currentState)
    const newStateYaml = formatYaml(newState)

    io.subheader({
      text: `Organization hierarchy`,
      marginTop: true,
    })

    io.message({
      text: `The organization hierarchy will be modified as follows:`,
    })
    io.message({
      text: diffStrings(currentStateYaml, newStateYaml),
      marginTop: true,
    })
  }

  const confirmDeploy = async ({
    organizationalUnitsPlan,
    basicConfigPlan,
    policiesPlan,
    organizationState,
  }: ConfirmOrganizationDeployProps): Promise<boolean> => {
    io.header({ text: "Review organization deployment plan", marginTop: true })
    io.longMessage(
      [
        "An organization deployment plan has been created and is shown below.",
        "Review each section carefully before proceeding.",
      ],
      false,
      false,
      0,
    )

    printEnabledPolicyTypesPlan(basicConfigPlan)
    printPoliciesDeploymentPlan(policiesPlan)
    printOrganizationalUnitsDeploymentPlan(
      organizationalUnitsPlan,
      organizationState,
    )

    return await io.confirm("Continue to deploy the organization?", true)
  }

  const printOutput = (
    output: DeployOrganizationOutput,
  ): DeployOrganizationOutput => {
    const {
      policiesDeploymentResult,
      policiesCleanResult,
      organizationalUnitsDeploymentResult,
      organizationalUnitsCleanResult,
      basicConfigDeploymentResult,
      error,
    } = output

    io.header({ text: "Deployment summary", marginTop: true })

    if (error) {
      printError(io, error, logger.logLevel, 0)
    }

    const table = new Table()

    const results = []

    if (basicConfigDeploymentResult) {
      results.push({
        ...basicConfigDeploymentResult,
        name: "Deploy basic configuration",
      })
    }

    if (policiesDeploymentResult) {
      results.push({ ...policiesDeploymentResult, name: "Deploy policies" })
    }

    if (organizationalUnitsDeploymentResult) {
      results.push({
        ...organizationalUnitsDeploymentResult,
        name: "Deploy organizational units",
      })
    }

    if (organizationalUnitsCleanResult) {
      results.push({
        ...organizationalUnitsCleanResult,
        name: "Clean organizational units",
      })
    }

    if (policiesCleanResult) {
      results.push({ ...policiesCleanResult, name: "Clean policies" })
    }

    results.forEach((r) => {
      table.cell("Task", r.name)
      table.cell("Status", formatCommandStatus(r.status))
      table.cell("Message", r.message)
      table.newRow()
    })

    if (results.length > 0) {
      io.message({ text: table.toString(), marginTop: true })
    }

    return output
  }

  return {
    ...logger,
    printOutput,
    confirmDeploy,
  }
}
