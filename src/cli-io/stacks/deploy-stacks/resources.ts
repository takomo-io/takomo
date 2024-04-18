import * as R from "ramda"
import { DetailedChangeSet } from "../../../aws/cloudformation/model.js"
import { bold, green, orange, red, yellow } from "../../../utils/colors.js"
import { BaseIO } from "../../cli-io.js"
import {
  ChangeAction,
  Replacement,
  ResourceAttribute,
} from "@aws-sdk/client-cloudformation"

type ResourceOperation = "update" | "create" | "remove" | "replace"

export const formatResourceChange = (
  action: ChangeAction,
  replacement: Replacement,
  logicalResourceId: string,
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

// TODO: add support for ChangeAction.Dynamic and ChangeAction.Import
const resolveResourceOperation = (
  action: ChangeAction,
  replacement: Replacement,
): ResourceOperation => {
  switch (action) {
    case ChangeAction.Add:
      return "create"
    case ChangeAction.Modify:
      if (replacement === Replacement.True) {
        return "replace"
      } else if (replacement === Replacement.Conditional) {
        return "replace"
      } else {
        return "update"
      }
    case ChangeAction.Remove:
      return "remove"
    default:
      throw new Error(`Unsupported change action: ${action}`)
  }
}

const printAttributeAfterValue = (value: string | undefined): string => {
  if (!value) {
    return "<undefined>"
  }

  if (value === "{{changeSet:KNOWN_AFTER_APPLY}}") {
    return "<known after deploy>"
  }

  return value
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
    changes.map((c) => c.ResourceChange!.LogicalResourceId!.length),
  )

  const resourceNameColumnLength = Math.max(27, maxResourceNameLength)

  io.message({
    text: bold("Resources:"),
    marginTop: true,
  })

  changes.forEach((change) => {
    const {
      LogicalResourceId,
      Action,
      Replacement,
      Scope = [],
      PhysicalResourceId,
      ResourceType,
      Details = [],
    } = change.ResourceChange!

    io.message({
      text: formatResourceChange(
        Action!,
        Replacement!,
        LogicalResourceId!,
        resourceNameColumnLength,
      ),
      marginTop: true,
    })
    io.message({ text: `      type:                      ${ResourceType}` })
    io.message({
      text: `      physical id:               ${
        PhysicalResourceId ?? "<known after deploy>"
      }`,
    })

    if (Replacement) {
      io.message({ text: `      replacement:               ${Replacement}` })
    }

    if (Scope.length > 0) {
      io.message({ text: `      scope:                     ${Scope}` })
    }

    if (Details.length > 0) {
      io.message({ text: `      details:` })
      Details.forEach((detail) => {
        io.message({
          text: `        - causing entity:        ${detail.CausingEntity}`,
          marginTop: true,
        })
        io.message({
          text: `          evaluation:            ${detail.Evaluation}`,
        })
        io.message({
          text: `          change source:         ${detail.ChangeSource}`,
        })

        if (detail.Target) {
          io.message({ text: `target:`, indent: 10 })
          io.message({
            text: `attribute:           ${detail.Target.Attribute}`,
            indent: 12,
          })

          if (detail.Target.Attribute === ResourceAttribute.Properties) {
            io.message({
              text: `property name:       ${detail.Target.Name}`,
              indent: 12,
            })
          }

          io.message({
            text: `path:                ${detail.Target.Path}`,
            indent: 12,
          })

          io.message({
            text: `change type:         ${detail.Target.AttributeChangeType}`,
            indent: 12,
          })

          io.message({
            text: `before value:        ${detail.Target.BeforeValue}`,
            indent: 12,
          })

          io.message({
            text: `after value:         ${printAttributeAfterValue(detail.Target.AfterValue)}`,
            indent: 12,
          })

          io.message({
            text: `require recreation:  ${detail.Target.RequiresRecreation}`,
            indent: 12,
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
        c.ResourceChange!.Action!,
        c.ResourceChange!.Replacement!,
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
