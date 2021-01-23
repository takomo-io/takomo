import {
  DetailedChangeSet,
  LogicalResourceId,
  ResourceChangeAction,
  ResourceChangeReplacement,
} from "@takomo/aws-model"
import { bold, green, orange, red, yellow } from "@takomo/util"
import R from "ramda"
import { BaseIO } from "../../cli-io"

type ResourceOperation = "update" | "create" | "remove" | "replace"

export const formatResourceChange = (
  action: ResourceChangeAction,
  replacement: ResourceChangeReplacement,
  logicalResourceId: LogicalResourceId,
  columnLength: number,
): string => {
  switch (action) {
    case "Add":
      const addKey = `  + ${logicalResourceId}:`.padEnd(columnLength + 6)
      return green(`${addKey}(resource will be created)`)
    case "Modify":
      if (replacement === "True") {
        const replaceKey = `  ± ${logicalResourceId}:`.padEnd(columnLength + 6)
        return orange(`${replaceKey}(resource will be replaced)`)
      } else if (replacement === "Conditional") {
        const replaceKey = `  ± ${logicalResourceId}:`.padEnd(columnLength + 6)
        return orange(`${replaceKey}(resource might be replaced)`)
      } else {
        const updateKey = `  ~ ${logicalResourceId}:`.padEnd(columnLength + 6)
        return yellow(`${updateKey}(resource will be updated)`)
      }
    case "Remove":
      const deleteKey = `  - ${logicalResourceId}:`.padEnd(columnLength + 6)
      return red(`${deleteKey}(resource will be removed)`)
    default:
      throw new Error(`Unsupported change action: ${action}`)
  }
}

const resolveResourceOperation = (
  action: ResourceChangeAction,
  replacement: ResourceChangeReplacement,
): ResourceOperation => {
  switch (action) {
    case "Add":
      return "create"
    case "Modify":
      if (replacement === "True") {
        return "replace"
      } else if (replacement === "Conditional") {
        return "replace"
      } else {
        return "update"
      }
    case "Remove":
      return "remove"
    default:
      throw new Error(`Unsupported change action: ${action}`)
  }
}

export const printResources = (
  io: BaseIO,
  changeSet?: DetailedChangeSet,
): boolean => {
  if (!changeSet) {
    return false
  }

  const changes = changeSet.changes
  if (changes.length === 0) {
    return false
  }

  const maxResourceNameLength = R.apply(
    Math.max,
    changes.map((c) => c.resourceChange.logicalResourceId.length),
  )

  const resourceNameColumnLength = Math.max(27, maxResourceNameLength)

  io.message({
    text: bold("Resources:"),
    marginTop: true,
  })

  changes.forEach((change) => {
    const {
      logicalResourceId,
      action,
      replacement,
      scope,
      physicalResourceId,
      resourceType,
      details,
    } = change.resourceChange

    io.message({
      text: formatResourceChange(
        action,
        replacement,
        logicalResourceId,
        resourceNameColumnLength,
      ),
      marginTop: true,
    })
    io.message({ text: `      type:                      ${resourceType}` })
    io.message({
      text: `      physical id:               ${
        physicalResourceId || "<known after deploy>"
      }`,
    })

    if (replacement) {
      io.message({ text: `      replacement:               ${replacement}` })
    }

    if (scope.length > 0) {
      io.message({ text: `      scope:                     ${scope}` })
    }

    if (details.length > 0) {
      io.message({ text: `      details:` })
      details.forEach((detail) => {
        io.message({
          text: `        - causing entity:        ${detail.causingEntity}`,
        })
        io.message({
          text: `          evaluation:            ${detail.evaluation}`,
        })
        io.message({
          text: `          change source:         ${detail.changeSource}`,
        })

        if (detail.target) {
          io.message({ text: `          target:` })
          io.message({
            text: `            attribute:           ${detail.target.attribute}`,
          })
          io.message({
            text: `            name:                ${detail.target.name}`,
          })
          io.message({
            text: `            require recreation:  ${detail.target.requiresRecreation}`,
          })
        } else {
          io.message({ text: `          target:                undefined` })
        }
      })
    }
  })

  if (changes.length < 2) {
    return true
  }

  const operationCounts = R.countBy(
    (c) =>
      resolveResourceOperation(
        c.resourceChange.action,
        c.resourceChange.replacement,
      ),
    changes,
  )

  const counts = Object.entries(operationCounts)
    .map(([key, count]) => {
      switch (key) {
        case "create":
          return { order: "1", text: green(`create: ${count}`) }
        case "update":
          return { order: "2", text: yellow(`update: ${count}`) }
        case "replace":
          return { order: "3", text: orange(`replace: ${count}`) }
        case "remove":
          return { order: "4", text: red(`remove: ${count}`) }
        default:
          throw new Error(`Unsupported resource operation: '${key}'`)
      }
    })
    .sort((a, b) => a.order.localeCompare(b.order))
    .map((o) => o.text)
    .join(", ")

  io.message({
    text: `  changed resources | total: ${changes.length}, ${counts}`,
    marginTop: true,
  })

  return true
}
