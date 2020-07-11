import { Options } from "@takomo/core"
import {
  DeploymentPlanHolder,
  DeployOrganizationIO,
  DeployOrganizationOutput,
  OrganizationalUnitsDeploymentPlan,
  OrganizationBasicConfigDeploymentPlan,
  PlannedAccounts,
  PlannedOrganizationalUnit,
  PlannedPolicies,
  PlannedPolicy,
  PolicyDeploymentPlan,
} from "@takomo/organization"
import { green, identity, red, yellow } from "@takomo/util"
import Table from "easy-table"
import CliIO from "../cli-io"
import { formatCommandStatus } from "../formatters"

interface Formatters {
  header: (value: string) => string
  add: (value: string) => string
  remove: (value: string) => string
  retain: (value: string) => string
}

const addFormatter = (s: string) => green("+" + s.slice(1))
const deleteFormatter = (s: string) => red("-" + s.slice(1))

export class CliDeployOrganizationIO extends CliIO
  implements DeployOrganizationIO {
  constructor(options: Options) {
    super(options)
  }

  confirmLaunch = async (plan: DeploymentPlanHolder): Promise<boolean> => {
    this.subheader("Review organization deployment plan", true)
    this.longMessage(
      [
        "An organization deployment plan has been created and is shown below.",
        "Changes are indicated with the following symbols:",
        "",
        `  ${green("+ add")}`,
        `  ${red("- remove")}`,
        `  ${yellow("~ modify")}`,
        "",
        "Following changes will be executed:",
      ],
      false,

      true,
    )

    this.printEnabledPolicyTypes(plan.plan.organizationBasicConfigPlan)
    this.printTrustedServices(plan.plan.organizationBasicConfigPlan)
    this.printPoliciesDeploymentPlan(plan.plan.policiesPlan)
    this.printOrganizationalUnits(plan.plan.organizationalUnitsPlan)

    return await this.confirm("Continue to deploy the organization?", true)
  }

  printOutput = (
    output: DeployOrganizationOutput,
  ): DeployOrganizationOutput => {
    const {
      policiesDeploymentResult,
      policiesCleanResult,
      organizationalUnitsDeploymentResult,
      organizationalUnitsCleanResult,
      basicConfigDeploymentResult,
      basicConfigCleanResult,
    } = output

    this.header("Deployment summary", true)

    const table = new Table()

    const results = [
      { ...basicConfigDeploymentResult, name: "Deploy basic configuration" },
      { ...policiesDeploymentResult, name: "Deploy policies" },
      {
        ...organizationalUnitsDeploymentResult,
        name: "Deploy organizational units",
      },
      { ...organizationalUnitsCleanResult, name: "Clean organizational units" },
      { ...policiesCleanResult, name: "Clean policies" },
      { ...basicConfigCleanResult, name: "Clean basic configuration" },
    ]

    results.forEach((r) => {
      table.cell("Task", r.name)
      table.cell("Status", formatCommandStatus(r.status))
      table.cell("Message", r.message)
      table.newRow()
    })

    this.message(table.toString(), true)

    return output
  }

  private printPlannedAccounts = (
    { retain, remove, add }: PlannedAccounts,
    formatters: Formatters,
    indent: number,
  ): void => {
    const padding = " ".repeat(indent)

    const accounts = [
      ...retain.map((account) => ({
        account,
        format: formatters.retain,
        nestedFormat: {
          header: identity,
          add: addFormatter,
          remove: deleteFormatter,
          retain: identity,
        },
      })),
      ...remove.map((account) => ({
        account,
        format: formatters.remove,
        nestedFormat: {
          header: deleteFormatter,
          add: deleteFormatter,
          remove: deleteFormatter,
          retain: deleteFormatter,
        },
      })),
      ...add.map((account) => ({
        account,
        format: formatters.add,
        nestedFormat: {
          header: addFormatter,
          add: addFormatter,
          remove: addFormatter,
          retain: addFormatter,
        },
      })),
    ].sort((a, b) => a.account.id.localeCompare(b.account.id))

    if (accounts.length === 0) {
      this.message(formatters.header(`${padding}accounts: []`))
      return
    }

    this.message(formatters.header(`${padding}accounts:`))
    const accountPadding = `  ${padding}`

    accounts.forEach(({ account, format, nestedFormat }) => {
      this.message(format(`${accountPadding}- id: ${account.id}`))
      this.printPlannedPolicies(
        "service control policies",
        account.serviceControlPolicies,
        nestedFormat,
        indent + 4,
      )
      this.printPlannedPolicies(
        "tag policies",
        account.tagPolicies,
        nestedFormat,
        indent + 4,
      )
      this.printPlannedPolicies(
        "ai services opt-out policies",
        account.aiServicesOptOutPolicies,
        nestedFormat,
        indent + 4,
      )
      this.printPlannedPolicies(
        "backup policies",
        account.backupPolicies,
        nestedFormat,
        indent + 4,
      )
    })
  }

  private printPlannedPolicies = (
    policyName: string,
    { remove, retain, add }: PlannedPolicies,
    formatters: Formatters,
    indent: number,
  ): void => {
    const headerPadding = " ".repeat(indent)

    const policies = [
      ...retain.map((name) => ({
        name,
        format: formatters.retain,
      })),
      ...remove.map((name) => ({
        name,
        format: formatters.remove,
      })),
      ...add.map((name) => ({
        name,
        format: formatters.add,
      })),
    ].sort((a, b) => a.name.localeCompare(b.name))

    if (policies.length === 0) {
      this.message(formatters.header(`${headerPadding}${policyName}: []`))
      return
    }

    this.message(formatters.header(`${headerPadding}${policyName}:`))

    const padding = " ".repeat(indent + 2)

    policies.forEach(({ name, format }) =>
      this.message(format(`${padding}- ${name}`)),
    )
  }

  printOrganizationalUnits = (
    plan: OrganizationalUnitsDeploymentPlan,
  ): void => {
    this.message("   organizational units:", true)

    const collectOus = (
      ou: PlannedOrganizationalUnit,
    ): PlannedOrganizationalUnit[] => {
      return ou.children.reduce(
        (collected, child) => [...collected, ...collectOus(child)],
        [ou],
      )
    }

    const ous = collectOus(plan.root)

    ous.forEach((ou) => {
      switch (ou.operation) {
        case "delete":
          this.message(red(`-    ${ou.path}:`))

          const deleteFormatters = {
            header: deleteFormatter,
            add: deleteFormatter,
            remove: deleteFormatter,
            retain: deleteFormatter,
          }

          this.printPlannedPolicies(
            "service control policies",
            ou.serviceControlPolicies,
            deleteFormatters,
            7,
          )

          this.printPlannedPolicies(
            "tag policies",
            ou.tagPolicies,
            deleteFormatters,
            7,
          )

          this.printPlannedPolicies(
            "ai services opt-out policies",
            ou.aiServicesOptOutPolicies,
            deleteFormatters,
            7,
          )

          this.printPlannedPolicies(
            "backup policies",
            ou.backupPolicies,
            deleteFormatters,
            7,
          )

          this.printPlannedAccounts(ou.accounts, deleteFormatters, 7)

          break

        case "add":
          this.message(green(`+    ${ou.path}:`))

          const addFormatters = {
            header: addFormatter,
            add: addFormatter,
            remove: addFormatter,
            retain: addFormatter,
          }

          this.printPlannedPolicies(
            "service control policies",
            ou.serviceControlPolicies,
            addFormatters,
            7,
          )

          this.printPlannedPolicies(
            "tag policies",
            ou.tagPolicies,
            addFormatters,
            7,
          )

          this.printPlannedPolicies(
            "ai services opt-out polcies",
            ou.aiServicesOptOutPolicies,
            addFormatters,
            7,
          )

          this.printPlannedPolicies(
            "backup policies",
            ou.backupPolicies,
            addFormatters,
            7,
          )

          this.printPlannedAccounts(ou.accounts, addFormatters, 7)

          break
        default:
          this.message(`     ${ou.path}:`)

          const updateFormatters = {
            header: identity,
            add: addFormatter,
            retain: identity,
            remove: deleteFormatter,
          }

          this.printPlannedPolicies(
            "service control policies",
            ou.serviceControlPolicies,
            updateFormatters,
            7,
          )

          this.printPlannedPolicies(
            "tag policies",
            ou.tagPolicies,
            updateFormatters,
            7,
          )

          this.printPlannedPolicies(
            "ai services opt-out policies",
            ou.aiServicesOptOutPolicies,
            updateFormatters,
            7,
          )

          this.printPlannedPolicies(
            "backup policies",
            ou.backupPolicies,
            updateFormatters,
            7,
          )

          this.printPlannedAccounts(ou.accounts, updateFormatters, 7)

          break
      }
    })
  }

  printPoliciesDeploymentPlan = (plan: PolicyDeploymentPlan): void => {
    const {
      serviceControlPolicies,
      tagPolicies,
      aiServicesOptOutPolicies,
      backupPolicies,
    } = plan

    this.message("   policies:", true)
    this.printPolicies("service control policies", serviceControlPolicies)
    this.printPolicies("tag policies", tagPolicies)
    this.printPolicies("ai services opt-out policies", aiServicesOptOutPolicies)
    this.printPolicies("backup policies", backupPolicies)
  }

  private printPolicies = (type: string, policies: PlannedPolicy[]): void => {
    if (policies.length === 0) {
      this.message(`     ${type}: []`)
      return
    }

    this.message(`     ${type}:`)

    policies.forEach((policy) => {
      switch (policy.operation) {
        case "add":
          this.message(green(`+      ${policy.name}:`))
          this.message(green(`+        id: <known after deploy>`))
          this.message(green(`+        description: ${policy.newDescription}`))
          break
        case "update":
          this.message(yellow(`~      ${policy.name}:`))
          this.message(yellow(`~        id: ${policy.id}`))
          this.message(yellow(`~        description: ${policy.newDescription}`))
          break
        case "delete":
          this.message(red(`-      ${policy.name}:`))
          this.message(red(`-        id: ${policy.id}`))
          this.message(
            red(`-        description: ${policy.currentDescription}`),
          )
          break
        case "skip":
          this.message(`       ${policy.name}:`)
          this.message(`         id: ${policy.id}`)
          this.message(`         description: ${policy.currentDescription}`)
          break
        default:
          throw new Error(`Unsupported operation: '${policy.operation}'`)
      }
    })
  }

  printEnabledPolicyTypes = (
    plan: OrganizationBasicConfigDeploymentPlan,
  ): void => {
    this.message("   enabled policy types:")

    const policies = [
      ...plan.enabledPolicies.retain.map((name) => ({
        name,
        operation: "retain",
      })),
      ...plan.enabledPolicies.add.map((name) => ({ name, operation: "add" })),
      ...plan.enabledPolicies.remove.map((name) => ({
        name,
        operation: "remove",
      })),
    ].sort((a, b) => a.name.localeCompare(b.name))

    policies.forEach((s) => {
      switch (s.operation) {
        case "add":
          this.message(green(`+    - ${s.name}`))
          break
        case "remove":
          this.message(red(`-    - ${s.name}`))
          break
        default:
          this.message(`     - ${s.name}`)
      }
    })
  }

  printTrustedServices = (
    plan: OrganizationBasicConfigDeploymentPlan,
  ): void => {
    const services = [
      ...plan.trustedServices.retain.map((name) => ({
        name,
        operation: "retain",
      })),
      ...plan.trustedServices.add.map((name) => ({ name, operation: "add" })),
      ...plan.trustedServices.remove.map((name) => ({
        name,
        operation: "remove",
      })),
    ].sort((a, b) => a.name.localeCompare(b.name))

    if (services.length === 0) {
      this.message("   trusted AWS services: []", true)
      return
    }

    this.message("   trusted AWS services:", true)

    services.forEach((s) => {
      switch (s.operation) {
        case "add":
          this.message(green(`+    - ${s.name}`))
          break
        case "remove":
          this.message(red(`-    - ${s.name}`))
          break
        default:
          this.message(`     - ${s.name}`)
      }
    })
  }
}
