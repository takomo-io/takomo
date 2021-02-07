import {
  ConfirmOrganizationDeployProps,
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
import { createBaseIO } from "../cli-io"
import { printError } from "../common"
import { formatCommandStatus } from "../formatters"
import { IOProps } from "../stacks/common"

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

export const createDeployOrganizationIO = (
  props: IOProps,
): DeployOrganizationIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printTrustedServicesPlan = (
    plan: OrganizationBasicConfigDeploymentPlan,
  ): void => {
    io.subheader({ text: "Trusted AWS services", marginTop: true })

    const { add, remove } = plan.trustedServices
    if (add.length + remove.length === 0) {
      io.message({ text: "No changes to trusted AWS services" })
      return
    }

    if (add.length > 0) {
      io.message({
        text: `Access for the following ${add.length} service(s) will be enabled:`,
        marginTop: false,
        marginBottom: true,
      })
      add.forEach((s) => {
        io.message({ text: green(`  - ${s}`) })
      })
    }

    if (remove.length > 0) {
      io.message({
        text: `Access for the following ${remove.length} service(s) will be disabled:`,
        marginTop: false,
        marginBottom: true,
      })
      remove.forEach((s) => {
        io.message({ text: red(`  - ${s}`) })
      })
    }
  }

  const printEnabledPolicyTypesPlan = (
    plan: OrganizationBasicConfigDeploymentPlan,
  ): void => {
    io.subheader({ text: "Policy types", marginTop: true })
    const { add, remove } = plan.enabledPolicies

    if (add.length + remove.length === 0) {
      io.message({ text: "No changes to enabled policy types" })
      return
    }

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
    io.subheader({ text: "Policies", marginTop: true })

    if (!plan.hasChanges) {
      io.message({ text: "No changes to policies" })
      return
    }

    const { serviceControl, tag, aiServicesOptOut, backup } = plan
    const allPolicies = [serviceControl, tag, aiServicesOptOut, backup]
    const policiesToRemove = flatten(allPolicies.map((p) => p.remove))
    const policiesToAdd = flatten(allPolicies.map((p) => p.add))
    const policiesToUpdate = flatten(allPolicies.map((p) => p.update))

    if (policiesToAdd.length > 0) {
      io.message({
        text: `The following ${policiesToAdd.length} policies will be added:`,
        marginTop: false,
        marginBottom: true,
      })
      policiesToAdd.forEach((p) => {
        io.message({ text: green(`  - name: ${p.name}`) })
        io.message({ text: green(`    type: ${p.type}`) })
      })
      io.print()
    }

    if (policiesToUpdate.length > 0) {
      io.message({
        text: `The following ${policiesToUpdate.length} policies will be updated:`,
        marginTop: false,
        marginBottom: true,
      })
      policiesToUpdate.forEach((p) => {
        io.message({ text: yellow(`  - name: ${p.name}`) })
        io.message({ text: yellow(`    type: ${p.type}`) })
      })
      io.print()
    }

    if (policiesToRemove.length > 0) {
      io.message({
        text: `The following ${policiesToRemove.length} policies will be removed:`,
        marginTop: false,
        marginBottom: true,
      })
      policiesToRemove.forEach((p) => {
        io.message({ text: red(`  - name: ${p.name}`) })
        io.message({ text: red(`    type: ${p.type}`) })
      })
      io.print()
    }
  }

  const printOrganizationalUnit = (
    ou: PlannedOrganizationalUnit,
    depth: number,
    printer?: (message: string) => void,
  ): void => {
    if (!printer) {
      switch (ou.operation) {
        case "delete":
          printOrganizationalUnit(ou, depth, (message: string) =>
            io.message({ text: red("- " + "  ".repeat(depth) + message) }),
          )
          return
        case "add":
          printOrganizationalUnit(ou, depth, (message: string) =>
            io.message({ text: green("+ " + "  ".repeat(depth) + message) }),
          )
          return
      }
    }

    const print =
      printer ||
      ((message: string) =>
        io.message({ text: "  ".repeat(depth + 1) + message }))

    print(`${ou.name}:`)
    if (ou.children.length > 0) {
      print("  children:")
      ou.children.forEach((child) => {
        printOrganizationalUnit(child, depth + 2)
      })
    }
  }

  const printPolicyOperations = (
    name: string,
    { inherited, attached }: OrgEntityPolicyOperationsPlan,
    formatters: Formatters,
    inclusions: PolicyOperationsToInclude,
    depth: number,
  ): void => {
    const attachedAdd = uniq(inclusions.add ? attached.add : []).map(
      (name) => ({
        name,
        operation: "add",
        formatter: formatters.add,
        type: "attached",
      }),
    )

    const attachedRetain = uniq(inclusions.retain ? attached.retain : []).map(
      (name) => ({
        name,
        operation: "retain",
        formatter: formatters.retain,
        type: "attached",
      }),
    )

    const attachedRemove = uniq(inclusions.remove ? attached.remove : []).map(
      (name) => ({
        name,
        operation: "remove",
        formatter: formatters.remove,
        type: "attached",
      }),
    )

    const attachedNames = [
      ...attachedAdd,
      ...attachedRemove,
      ...attachedRetain,
    ].map((a) => a.name)

    const inheritedAdd = uniq(inclusions.add ? inherited.add : []).map(
      (name) => ({
        name,
        operation: "add",
        formatter: formatters.add,
        type: "inherited",
      }),
    )

    const inheritedRetain = uniq(inclusions.retain ? inherited.retain : []).map(
      (name) => ({
        name,
        operation: "retain",
        formatter: formatters.retain,
        type: "inherited",
      }),
    )

    const inheritedRemove = uniq(inclusions.remove ? inherited.remove : []).map(
      (name) => ({
        name,
        operation: "remove",
        formatter: formatters.remove,
        type: "inherited",
      }),
    )

    const all = [
      ...attachedRetain,
      ...attachedRemove,
      ...attachedAdd,
      ...inheritedRetain,
      ...inheritedRemove,
      ...inheritedAdd,
    ]

    if (all.length === 0) {
      return
    }

    if (all.every((p) => p.operation === "remove")) {
      io.message({ text: deleteFormatter(`${" ".repeat(depth)}${name}:`) })
    } else if (all.every((p) => p.operation === "add")) {
      io.message({ text: addFormatter(`${" ".repeat(depth)}${name}:`) })
    } else {
      io.message({ text: formatters.header(`${" ".repeat(depth)}${name}:`) })
    }

    all
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(({ name, formatter, type }) => {
        io.message({
          text: formatter(`${" ".repeat(depth + 2)}- ${name}   (${type})`),
        })
      })
  }

  const printPolicies = (
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

    printPolicyOperations(
      "serviceControlPolicies",
      serviceControl,
      formatters,
      inclusions,
      depth,
    )

    printPolicyOperations("tagPolicies", tag, formatters, inclusions, depth)

    printPolicyOperations(
      "backupPolicies",
      backup,
      formatters,
      inclusions,
      depth,
    )

    printPolicyOperations(
      "aiServicesOptOutPolicies",
      aiServicesOptOut,
      formatters,
      inclusions,
      depth,
    )
  }

  const printOrganizationalUnitsDeploymentPlan = ({
    root,
    hasChanges,
  }: OrganizationalUnitsDeploymentPlan): void => {
    io.subheader({ text: "Organizational units", marginTop: true })

    if (!hasChanges) {
      io.message({ text: "No changes to organizational units" })
      return
    }

    const ous = collectFromHierarchy(root, (ou) => ou.children, {
      sortSiblings: (a, b) => a.path.localeCompare(b.path),
    })

    const ousToAdd = ous.filter((ou) => ou.operation === "add")
    const ousToUpdate = ous.filter((ou) => ou.operation === "update")
    const ousToDelete = ous.filter((ou) => ou.operation === "delete")

    if (ousToAdd.length > 0) {
      io.message({
        text: `The following ${ousToAdd.length} organizational unit(s) will be added:`,
        marginTop: false,
        marginBottom: true,
      })
      ousToAdd.forEach((ou) => {
        io.message({ text: green(`  - path: ${ou.path}`) })
        io.message({ text: green(`    id: <known after deploy>`) })
        printPolicies(
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
          io.message({ text: green(`    accounts:`) })
          ou.accounts.add.forEach((a) => {
            io.message({ text: green(`      - id: ${a.id}`) })
            printPolicies(
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

      io.print()
    }

    if (ousToUpdate.length > 0) {
      io.message({
        text: `The following ${ousToUpdate.length} organizational unit(s) will be updated:`,
        marginTop: false,
        marginBottom: true,
      })
      ousToUpdate.forEach((ou) => {
        io.message({ text: `  - path: ${ou.path}` })
        io.message({ text: `    id: ${ou.id}` })
        printPolicies(
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
          io.message({ text: `    accounts:` })
          add.forEach((a) => {
            io.message({ text: green(`      - id: ${a.id}`) })
            printPolicies(
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
            io.message({ text: `      - id: ${a.id}` })
            printPolicies(
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
            io.message({ text: red(`      - id: ${a.id}`) })
            printPolicies(
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

      io.print()
    }

    if (ousToDelete.length > 0) {
      io.message({
        text: `The following ${ousToDelete.length} organizational unit(s) will be deleted:`,
        marginTop: false,
        marginBottom: true,
      })
      ousToDelete.forEach((ou) => {
        io.message({ text: red(`  - path: ${ou.path}`) })
        io.message({ text: red(`    id: ${ou.id}`) })
        printPolicies(
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
          io.message({ text: red(`    accounts:`) })
          ou.accounts.remove.forEach((a) => {
            io.message({ text: red(`      - id: ${a.id}`) })
            printPolicies(
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

      io.print()
    }
  }

  const confirmDeploy = async ({
    organizationalUnitsPlan,
    basicConfigPlan,
    policiesPlan,
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

    printTrustedServicesPlan(basicConfigPlan)
    printEnabledPolicyTypesPlan(basicConfigPlan)
    printPoliciesDeploymentPlan(policiesPlan)
    printOrganizationalUnitsDeploymentPlan(organizationalUnitsPlan)

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
      basicConfigCleanResult,
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

    if (basicConfigCleanResult) {
      results.push({
        ...basicConfigCleanResult,
        name: "Clean basic configuration",
      })
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
