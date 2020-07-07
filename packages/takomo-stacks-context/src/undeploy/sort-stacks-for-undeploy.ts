import { Stack } from "@takomo/stacks-model"
import { collectAllDependants } from "../dependencies"

export const sortStacksForUndeploy = (stacks: Stack[]): Stack[] =>
  stacks.slice().sort((a, b) => {
    if (a.getDependants().length === 0 && b.getDependants().length > 0) {
      return -1
    }
    if (b.getDependants().length === 0 && a.getDependants().length > 0) {
      return 1
    }
    if (collectAllDependants(a.getPath(), stacks).includes(b.getPath())) {
      return 1
    }
    if (collectAllDependants(b.getPath(), stacks).includes(a.getPath())) {
      return -1
    }

    return a.getPath().localeCompare(b.getPath())
  })
