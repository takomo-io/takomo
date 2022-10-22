import crypto from "crypto"
import { diffLines } from "diff"
import { v4 } from "uuid"
import { green, red } from "./colors"

/**
 * @hidden
 */
export const indentLines = (string: string, indent = 2): string => {
  const padding = " ".repeat(indent)
  return string
    .split("\n")
    .map((line) => `${padding}${line}`)
    .join("\n")
}

/**
 * @hidden
 */
export const checksum = (string: string): string =>
  crypto.createHash("sha256").update(string, "utf8").digest("hex")

/**
 * @hidden
 */
export const splitTextInLines = (
  lineWidth: number,
  ...lines: ReadonlyArray<string>
): ReadonlyArray<string> => {
  const all = lines.join(" ")
  if (all.length === 0) {
    return [all]
  }

  const [firstWord, ...remainingWords] = all.split(/\s+/g)
  return remainingWords
    .reduce(
      (collected, word) => {
        const [currentLine, ...rest] = collected
        return currentLine.length + word.length + 1 > lineWidth
          ? [word, ...collected]
          : [`${currentLine} ${word}`, ...rest]
      },
      [firstWord],
    )
    .reverse()
}

/**
 * @hidden
 */
export const uuid = v4

const processChange = (
  content: string,
  handler: (line: string) => string,
): string => {
  return (
    content
      .substr(0, content.length - 1)
      .split("\n")
      .map(handler)
      .join("\n") + "\n"
  )
}

const addedLine = (line: string) => green(`+ ${line}`)
const removedLine = (line: string) => red(`- ${line}`)
const unchangedLine = (line: string) => `  ${line}`

/**
 * @hidden
 */
export const diffStrings = (current: string, updated: string): string =>
  diffLines(current, updated, {})
    .map(({ removed, added, value }) => {
      if (added) return processChange(value, addedLine)
      else if (removed) return processChange(value, removedLine)
      else return processChange(value, unchangedLine)
    })
    .join("")
