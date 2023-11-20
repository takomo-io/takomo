import * as R from "ramda"
import {
  DetailedChangeSet,
  DetailedCloudFormationStack,
} from "../../../aws/cloudformation/model.js"
import { Tag, TagKey, TagValue } from "../../../aws/common/model.js"
import { bold, green, red, yellow } from "../../../utils/colors.js"
import { BaseIO } from "../../cli-io.js"
import { printValue } from "./common.js"

export type TagOperation = "update" | "create" | "delete"

export interface TagSpec {
  readonly key: TagKey
  readonly newValue?: TagValue
  readonly currentValue?: TagValue
  readonly operation: TagOperation
}

export interface TagsSpec {
  readonly updated: ReadonlyArray<TagSpec>
  readonly added: ReadonlyArray<TagSpec>
  readonly removed: ReadonlyArray<TagSpec>
}

export const formatTagOperation = (
  tag: TagSpec,
  columnLength: number,
): string => {
  switch (tag.operation) {
    case "create":
      const addKey = `+ ${tag.key}:`.padEnd(columnLength + 4)
      return green(`${addKey}(tag will be created)`)
    case "delete":
      const deleteKey = `- ${tag.key}:`.padEnd(columnLength + 4)
      return red(`${deleteKey}(tag will be removed)`)
    case "update":
      const updateKey = `~ ${tag.key}:`.padEnd(columnLength + 4)
      return yellow(`${updateKey}(tag will be updated)`)
    default:
      throw new Error(`Unsupported tag operation: '${tag.operation}'`)
  }
}

export const collectUpdatedTags = (
  newTags: ReadonlyArray<Tag>,
  existingTags: ReadonlyArray<Tag>,
): ReadonlyArray<TagSpec> => {
  const existingTagKeys = existingTags.map((t) => t.key)
  return newTags
    .filter((t) => existingTagKeys.includes(t.key))
    .map((newTag) => {
      const existingTag = existingTags.find((t) => t.key === newTag.key)
      if (!existingTag) {
        throw new Error("Expected tag to be defined")
      }

      const t: TagSpec = {
        key: newTag.key,
        operation: "update",
        newValue: newTag.value,
        currentValue: existingTag.value,
      }

      return t
    })
    .filter((t) => t.newValue !== t.currentValue)
    .sort((a, b) => a.key.localeCompare(b.key))
}

export const collectAddedTags = (
  newTags: ReadonlyArray<Tag>,
  existingTags: ReadonlyArray<Tag>,
): ReadonlyArray<TagSpec> => {
  const existingTagKeys = existingTags.map((t) => t.key)
  return newTags
    .filter((t) => !existingTagKeys.includes(t.key))
    .map(
      (t) =>
        ({
          key: t.key,
          operation: "create",
          newValue: t.value,
          currentValue: undefined,
        }) as TagSpec,
    )
    .sort((a, b) => a.key.localeCompare(b.key))
}

export const collectRemovedTags = (
  newTags: ReadonlyArray<Tag>,
  existingTags: ReadonlyArray<Tag>,
): ReadonlyArray<TagSpec> => {
  const newTagKeys = newTags.map((t) => t.key)
  return existingTags
    .filter((t) => !newTagKeys.includes(t.key))
    .map(
      (t) =>
        ({
          key: t.key,
          operation: "delete",
          currentValue: t.value,
          newValue: undefined,
        }) as TagSpec,
    )
    .sort((a, b) => a.key.localeCompare(b.key))
}

export const buildTagsSpec = (
  changeSet: DetailedChangeSet,
  existingStack?: DetailedCloudFormationStack,
): TagsSpec => {
  const newTags = changeSet.tags
  const existingTags = existingStack?.tags ?? []

  const updated = collectUpdatedTags(newTags, existingTags)
  const added = collectAddedTags(newTags, existingTags)
  const removed = collectRemovedTags(newTags, existingTags)

  return {
    updated,
    added,
    removed,
  }
}

export const printTags = (
  io: BaseIO,
  changeSet?: DetailedChangeSet,
  existingStack?: DetailedCloudFormationStack,
): boolean => {
  if (!changeSet) {
    return false
  }

  const { updated, added, removed } = buildTagsSpec(changeSet, existingStack)
  const all = [...added, ...updated, ...removed]
  if (all.length === 0) {
    return false
  }

  const maxTagNameLength = R.apply(
    Math.max,
    all.map((t) => t.key.length),
  )

  const tagNameColumnLength = Math.max(27, maxTagNameLength)

  io.message({ text: bold("Tags:"), marginTop: true })

  all.forEach((tag) => {
    io.message({
      text: `  ${formatTagOperation(tag, tagNameColumnLength)}`,
      marginTop: true,
    })
    io.message({
      text: `      current value:             ${printValue(tag.currentValue)}`,
    })
    io.message({
      text: `      new value:                 ${printValue(tag.newValue)}`,
    })
  })

  if (all.length < 2) {
    return true
  }

  const counts = Object.entries(R.countBy((o) => o.operation, all))
    .map(([key, count]) => {
      switch (key) {
        case "create":
          return { order: "1", text: green(`create: ${count}`) }
        case "update":
          return { order: "2", text: yellow(`update: ${count}`) }
        case "delete":
          return { order: "3", text: red(`remove: ${count}`) }
        default:
          throw new Error(`Unsupported tag operation: '${key}'`)
      }
    })
    .sort((a, b) => a.order.localeCompare(b.order))
    .map((o) => o.text)
    .join(", ")

  io.message({
    text: `  changed tags | total: ${all.length}, ${counts}`,
    marginTop: true,
  })

  return true
}
