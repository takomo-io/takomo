import { CommandPath, StackPath } from "@takomo/core"
import { Stack, StackGroup } from "@takomo/stacks-model"
import uniq from "lodash.uniq"
import { isStackGroupPath } from "../common"
import { ConfigContext } from "../config/config-context"

const collectStacksToDeployFromStack = (
  stackPath: StackPath,
  ctx: ConfigContext,
  ignoreDependencies: boolean,
): StackPath[] => {
  const stacksToDeploy = []
  for (const stack of ctx.getStacksByPath(stackPath)) {
    stacksToDeploy.push(stack.getPath())

    if (!ignoreDependencies) {
      for (const dependency of stack.getDependencies()) {
        for (const dependencyPath of collectStacksToDeployFromStack(
          dependency,
          ctx,
          ignoreDependencies,
        )) {
          stacksToDeploy.push(dependencyPath)
        }
      }
    }
  }

  return uniq(stacksToDeploy)
}

const collectStacksToDeployFromStackGroup = (
  stackGroup: StackGroup,
  ctx: ConfigContext,
  ignoreDependencies: boolean,
): StackPath[] => {
  const stacksToDeploy = stackGroup
    .getStacks()
    .reduce(
      (all, s) => [
        ...all,
        ...collectStacksToDeployFromStack(s.getPath(), ctx, ignoreDependencies),
      ],
      new Array<StackPath>(),
    )

  const childStacksToDeploy = stackGroup
    .getChildren()
    .reduce(
      (all, sg) => [
        ...collectStacksToDeployFromStackGroup(sg, ctx, ignoreDependencies),
        ...all,
      ],
      new Array<StackPath>(),
    )

  return uniq([...stacksToDeploy, ...childStacksToDeploy])
}

export const collectStacksToDeploy = (
  ctx: ConfigContext,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
): Stack[] => {
  if (isStackGroupPath(commandPath)) {
    const stackGroup = ctx.getStackGroup(commandPath)
    if (!stackGroup) {
      return []
    }

    return collectStacksToDeployFromStackGroup(
      stackGroup,
      ctx,
      ignoreDependencies,
    ).map(ctx.getStackByExactPath)
  }

  return collectStacksToDeployFromStack(
    commandPath,
    ctx,
    ignoreDependencies,
  ).map(ctx.getStackByExactPath)
}
