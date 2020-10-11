import { CommandPath, StackPath } from "@takomo/core"
import { Stack, StackGroup } from "@takomo/stacks-model"
import uniq from "lodash.uniq"
import { isStackGroupPath } from "../common"
import { ConfigContext } from "../config/config-context"

const collectStacksToUndeployFromStack = (
  stackPath: StackPath,
  ctx: ConfigContext,
  ignoreDependencies: boolean,
): StackPath[] => {
  const collected = []
  for (const stack of ctx.getStacksByPath(stackPath)) {
    collected.push(stack.getPath())
    if (!ignoreDependencies) {
      for (const dependant of stack.getDependants()) {
        for (const dependantPath of collectStacksToUndeployFromStack(
          dependant,
          ctx,
          ignoreDependencies,
        )) {
          collected.push(dependantPath)
        }
      }
    }
  }

  return uniq(collected)
}

const collectStacksToUndeployFromStackGroup = (
  stackGroup: StackGroup,
  ctx: ConfigContext,
  ignoreDependencies: boolean,
): StackPath[] => {
  const collected = stackGroup.getStacks().reduce((all, s) => {
    return [
      ...all,
      ...collectStacksToUndeployFromStack(s.getPath(), ctx, ignoreDependencies),
    ]
  }, new Array<StackPath>())

  const childStacksToUndeploy = stackGroup.getChildren().reduce((all, sg) => {
    return [
      ...collectStacksToUndeployFromStackGroup(sg, ctx, ignoreDependencies),
      ...all,
    ]
  }, new Array<StackPath>())

  return uniq([...collected, ...childStacksToUndeploy])
}

export const collectStacksToUndeploy = (
  ctx: ConfigContext,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
): Stack[] => {
  if (isStackGroupPath(commandPath)) {
    const stackGroup = ctx.getStackGroup(commandPath)
    if (!stackGroup) {
      return []
    }

    return collectStacksToUndeployFromStackGroup(
      stackGroup,
      ctx,
      ignoreDependencies,
    ).map(ctx.getStackByExactPath)
  }

  return collectStacksToUndeployFromStack(
    commandPath,
    ctx,
    ignoreDependencies,
  ).map(ctx.getStackByExactPath)
}
