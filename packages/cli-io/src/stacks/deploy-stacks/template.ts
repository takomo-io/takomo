import { green, red } from "@takomo/util"
import { diffLines } from "diff"

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
  // if (content.endsWith("\n")) {
  //   return (
  //     content
  //       .substr(0, content.length - 1)
  //       .split("\n")
  //       .map(handler)
  //       .join("\n") + "\n"
  //   )
  // } else {
  //   return content.split("\n").map(handler).join("\n")
  // }
}

const addedLine = (line: string) => green(`+ ${line}`)
const removedLine = (line: string) => red(`- ${line}`)
const unchangedLine = (line: string) => `  ${line}`

export const diffTemplate = (current: string, updated: string): string =>
  diffLines(current, updated, {
    // newlineIsToken: true,
  })
    .map(({ removed, added, value }) => {
      if (added) return processChange(value, addedLine)
      else if (removed) return processChange(value, removedLine)
      else return processChange(value, unchangedLine)
    })
    .join("")
