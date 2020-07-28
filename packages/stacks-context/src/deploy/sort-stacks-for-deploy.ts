import { Stack } from "@takomo/stacks-model"

export const sortStacksForDeploy = (stacks: Stack[]): Stack[] =>
  stacks.slice().sort((a, b) => {
    if (a.getDependencies().length === 0) {
      return -1
    }
    if (b.getDependencies().length === 0) {
      return 1
    }
    if (b.getDependencies().includes(a.getPath())) {
      return -1
    }
    if (a.getDependencies().includes(b.getPath())) {
      return 1
    }

    return 0
  })
