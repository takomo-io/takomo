import { Options } from "@takomo/core"
import {
  DeploymentPlanHolder,
  DeployOrganizationIO,
  DeployOrganizationOutput,
  OrganizationalUnitsDeploymentPlan,
  OrganizationBasicConfigDeploymentPlan,
  OrgEntityPoliciesPlan,
  OrgEntityPolicyOperationsPlan,
  PlannedOrganizationalUnit,
  PolicyDeploymentPlan,
} from "@takomo/organization-commands"
import { collectFromHierarchy, green, red, yellow } from "@takomo/util"
import Table from "easy-table"
import flatten from "lodash.flatten"
import uniq from "lodash.uniq"
import CliIO from "../cli-io"
import { formatCommandStatus } from "../formatters"

interface Formatters {
  readonly header: (value: string) => string
  readonly add: (value: string) => string
  readonly remove: (value: string) => string
  retain: (value: string) => string
}

interface PolicyOperationsToInclude {
  readonly add: boolean
  readonly update: boolean
  readonly remove: boolean
  readonly retain: boolean
}

const addFormatter = (s: string) => green(s)
const deleteFormatter = (s: string) => red(s)

export class CliDeployOrganizationIO extends CliIO
  implements DeployOrganizationIO {
  constructor(options: Options) {
    super(options)
  }

  private printTrustedServicesPlan = (
    plan: OrganizationBasicConfigDeploymentPlan,
  ): void => {
    this.subheader("Trusted AWS services", true)

    const { add, remove } = plan.trustedServices
    if (add.length + remove.length === 0) {
      this.message("No changes to trusted AWS services")
      return
    }

    if (add.length > 0) {
      this.message(
        `Access for the following ${add.length} service(s) will be enabled:`,
        false,
        true,
      )
      add.forEach((s) => {
        this.message(green(`  - ${s}`))
      })
    }

    if (remove.length > 0) {
      this.message(
        `Access for the following ${remove.length} service(s) will be disabled:`,
        false,
        true,
      )
      add.forEach((s) => {
        this.message(red(`  - ${s}`))
      })
    }
  }

  private printEnabledPolicyTypesPlan = (
    plan: OrganizationBasicConfigDeploymentPlan,
  ): void => {
    this.subheader("Policy types", true)
    const { add, remove } = plan.enabledPolicies

    if (add.length + remove.length === 0) {
      this.message("No changes to enabled policy types")
      return
    }

    if (add.length > 0) {
      this.message(
        `The following ${add.length} policy types(s) will be enabled:`,
        false,
        true,
      )
      add.forEach((s) => {
        this.message(green(`  - ${s}`))
      })
    }

    if (remove.length > 0) {
      this.message(
        `The following ${remove.length} policy types(s) will be disabled:`,
        false,
        true,
      )
      remove.forEach((s) => {
        this.message(red(`  - ${s}`))
      })
    }
  }

  private printPoliciesDeploymentPlan = (plan: PolicyDeploymentPlan): void => {
    this.subheader("Policies", true)

    if (!plan.hasChanges) {
      this.message("No changes to policies")
      return
    }

    const { serviceControl, tag, aiServicesOptOut, backup } = plan
    const allPolicies = [serviceControl, tag, aiServicesOptOut, backup]
    const policiesToRemove = flatten(allPolicies.map((p) => p.remove))
    const policiesToAdd = flatten(allPolicies.map((p) => p.add))
    const policiesToUpdate = flatten(allPolicies.map((p) => p.update))

    if (policiesToAdd.length > 0) {
      this.message(
        `The following ${policiesToAdd.length} policies will be added:`,
        false,
        true,
      )
      policiesToAdd.forEach((p) => {
        this.message(green(`  - name: ${p.name}`))
        this.message(green(`    type: ${p.type}`))
      })
      this.message()
    }

    if (policiesToUpdate.length > 0) {
      this.message(
        `The following ${policiesToUpdate.length} policies will be updated:`,
        false,
        true,
      )
      policiesToUpdate.forEach((p) => {
        this.message(yellow(`  - name: ${p.name}`))
        this.message(yellow(`    type: ${p.type}`))
      })
      this.message()
    }

    if (policiesToRemove.length > 0) {
      this.message(
        `The following ${policiesToRemove.length} policies will be removed:`,
        false,
        true,
      )
      policiesToRemove.forEach((p) => {
        this.message(red(`  - name: ${p.name}`))
        this.message(red(`    type: ${p.type}`))
      })
      this.message()
    }
  }

  private printOrganizationalUnit = (
    ou: PlannedOrganizationalUnit,
    depth: number,
    printer?: (message: string) => void,
  ): void => {
    if (!printer) {
      switch (ou.operation) {
        case "delete":
          this.printOrganizationalUnit(ou, depth, (message: string) =>
            this.message(red("- " + "  ".repeat(depth) + message)),
          )
          return
        case "add":
          this.printOrganizationalUnit(ou, depth, (message: string) =>
            this.message(green("+ " + "  ".repeat(depth) + message)),
          )
          return
      }
    }

    const print =
      printer ||
      ((message: string) => this.message("  ".repeat(depth + 1) + message))

    print(`${ou.name}:`)
    if (ou.children.length > 0) {
      print("  children:")
      ou.children.forEach((child) => {
        this.printOrganizationalUnit(child, depth + 2)
      })
    }
  }

  private printPolicyOperations = (
    name: string,
    { inherited, attached }: OrgEntityPolicyOperationsPlan,
    formatters: Formatters,
    inclusions: PolicyOperationsToInclude,
    depth: number,
  ): void => {
    const retain = uniq(
      inclusions.retain ? attached.retain.concat(inherited.retain) : [],
    ).map((name) => ({
      name,
      operation: "retain",
      formatter: formatters.retain,
    }))

    const add = uniq(inclusions.add ? attached.add.concat(inherited.add) : [])
      .filter((name) => !retain.map((r) => r.name).includes(name))
      .map((name) => ({
        name,
        operation: "add",
        formatter: formatters.add,
      }))

    const remove = uniq(
      inclusions.remove ? attached.remove.concat(inherited.remove) : [],
    ).map((name) => ({
      name,
      operation: "remove",
      formatter: formatters.remove,
    }))

    const all = [...retain, ...add, ...remove]

    if (all.length === 0) {
      return
    }

    if (all.every((p) => p.operation === "remove")) {
      this.message(deleteFormatter(`${" ".repeat(depth)}${name}:`))
    } else if (all.every((p) => p.operation === "add")) {
      this.message(addFormatter(`${" ".repeat(depth)}${name}:`))
    } else {
      this.message(formatters.header(`${" ".repeat(depth)}${name}:`))
    }

    all.forEach(({ name, formatter }) => {
      this.message(formatter(`${" ".repeat(depth + 2)}- ${name}`))
    })
  }

  private printPolicies = (
    policies: OrgEntityPoliciesPlan,
    formatters: Formatters,
    inclusions: PolicyOperationsToInclude,
    depth: number,
  ): void => {
    const {
      aiServicesOptOut,
      backup,
      tag,
      serviceControl,
      hasChanges,
    } = policies

    if (!hasChanges) {
      return
    }

    this.printPolicyOperations(
      "serviceControlPolicies",
      serviceControl,
      formatters,
      inclusions,
      depth,
    )

    this.printPolicyOperations(
      "tagPolicies",
      tag,
      formatters,
      inclusions,
      depth,
    )

    this.printPolicyOperations(
      "backupPolicies",
      backup,
      formatters,
      inclusions,
      depth,
    )

    this.printPolicyOperations(
      "aiServicesOptOutPolicies",
      aiServicesOptOut,
      formatters,
      inclusions,
      depth,
    )
  }

  private printOrganizationalUnitsDeploymentPlan = ({
    root,
    hasChanges,
  }: OrganizationalUnitsDeploymentPlan): void => {
    this.subheader("Organizational units", true)

    if (!hasChanges) {
      this.message("No changes to organizational units")
      return
    }

    const ous = collectFromHierarchy(root, (ou) => ou.children, {
      sortSiblings: (a, b) => a.path.localeCompare(b.path),
    })

    const ousToAdd = ous.filter((ou) => ou.operation === "add")
    const ousToUpdate = ous.filter((ou) => ou.operation === "update")
    const ousToDelete = ous.filter((ou) => ou.operation === "delete")

    if (ousToAdd.length > 0) {
      this.message(
        `The following ${ousToAdd.length} organizational unit(s) will be added:`,
        false,
        true,
      )
      ousToAdd.forEach((ou) => {
        this.message(green(`  - path: ${ou.path}`))
        this.message(green(`    id: <known after deploy>`))
        this.printPolicies(
          ou.policies,
          {
            add: addFormatter,
            remove: addFormatter,
            retain: addFormatter,
            header: addFormatter,
          },
          {
            add: true,
            remove: false,
            update: false,
            retain: false,
          },
          4,
        )

        if (ou.accounts.add.length > 0) {
          this.message(green(`    accounts:`))
          ou.accounts.add.forEach((a) => {
            this.message(green(`      - id: ${a.id}`))
            this.printPolicies(
              a.policies,
              {
                add: addFormatter,
                remove: addFormatter,
                retain: addFormatter,
                header: addFormatter,
              },
              {
                add: true,
                remove: false,
                update: false,
                retain: false,
              },
              8,
            )
          })
        }
      })

      this.message()
    }

    if (ousToUpdate.length > 0) {
      this.message(
        `The following ${ousToUpdate.length} organizational unit(s) will be updated:`,
        false,
        true,
      )
      ousToUpdate.forEach((ou) => {
        this.message(`  - path: ${ou.path}`)
        this.message(`    id: ${ou.id}`)
        this.printPolicies(
          ou.policies,
          {
            add: addFormatter,
            remove: deleteFormatter,
            retain: (s: string) => s,
            header: (s: string) => s,
          },
          {
            add: true,
            remove: true,
            update: true,
            retain: true,
          },
          4,
        )

        const { remove, add, retain } = ou.accounts
        if (remove.length + add.length + retain.length > 0) {
          this.message(`    accounts:`)
          add.forEach((a) => {
            this.message(green(`      - id: ${a.id}`))
            this.printPolicies(
              a.policies,
              {
                add: addFormatter,
                remove: deleteFormatter,
                retain: addFormatter,
                header: addFormatter,
              },
              {
                add: true,
                remove: false,
                update: true,
                retain: true,
              },
              8,
            )
          })

          retain.forEach((a) => {
            this.message(`      - id: ${a.id}`)
            this.printPolicies(
              a.policies,
              {
                add: addFormatter,
                remove: deleteFormatter,
                retain: (s: string) => s,
                header: (s: string) => s,
              },
              {
                add: true,
                remove: true,
                update: true,
                retain: true,
              },
              8,
            )
          })

          remove.forEach((a) => {
            this.message(red(`      - id: ${a.id}`))
            this.printPolicies(
              a.policies,
              {
                add: deleteFormatter,
                remove: deleteFormatter,
                retain: deleteFormatter,
                header: deleteFormatter,
              },
              {
                add: true,
                remove: true,
                update: true,
                retain: true,
              },
              8,
            )
          })
        }
      })

      this.message()
    }

    if (ousToDelete.length > 0) {
      this.message(
        `The following ${ousToDelete.length} organizational unit(s) will be deleted:`,
        false,
        true,
      )
      ousToDelete.forEach((ou) => {
        this.message(red(`  - path: ${ou.path}`))
        this.message(red(`    id: ${ou.id}`))
        this.printPolicies(
          ou.policies,
          {
            add: deleteFormatter,
            remove: deleteFormatter,
            retain: deleteFormatter,
            header: deleteFormatter,
          },
          {
            add: false,
            remove: true,
            update: false,
            retain: false,
          },
          4,
        )

        if (ou.accounts.remove.length > 0) {
          this.message(red(`    accounts:`))
          ou.accounts.remove.forEach((a) => {
            this.message(red(`      - id: ${a.id}`))
            this.printPolicies(
              a.policies,
              {
                add: deleteFormatter,
                remove: deleteFormatter,
                retain: deleteFormatter,
                header: deleteFormatter,
              },
              {
                add: false,
                remove: true,
                update: false,
                retain: false,
              },
              8,
            )
          })
        }
      })

      this.message()
    }
  }

  confirmLaunch = async (plan: DeploymentPlanHolder): Promise<boolean> => {
    this.header("Review organization deployment plan", true)
    this.longMessage([
      "An organization deployment plan has been created and is shown below.",
      "Review each section carefully before proceeding.",
    ])

    this.printTrustedServicesPlan(plan.plan.organizationBasicConfigPlan)
    this.printEnabledPolicyTypesPlan(plan.plan.organizationBasicConfigPlan)
    this.printPoliciesDeploymentPlan(plan.plan.policiesPlan)
    this.printOrganizationalUnitsDeploymentPlan(
      plan.plan.organizationalUnitsPlan,
    )

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
}
