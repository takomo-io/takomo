import { CommandPath, StackPath } from "@takomo/core"
import { CommandContext, Stack, StackGroup } from "@takomo/stacks-model"
import uniq from "lodash.uniq"
import {
  isStackGroupPath,
  loadExistingStacks,
  loadExistingTemplateSummaries,
  validateStackCredentialProvidersWithAllowedAccountIds,
} from "../common"
import { ConfigContext } from "../config"
import { collectAllDependants } from "../dependencies"
import { CommandPathMatchesNoStacksError } from "../launch/build"
import { StdCommandContext } from "../model"

const collectStacksToDeleteFromStack = (
  stackPath: StackPath,
  ctx: ConfigContext,
  ignoreDependencies: boolean,
): StackPath[] => {
  const stacksToDelete = []
  for (const stack of ctx.getStacksByPath(stackPath)) {
    stacksToDelete.push(stack.getPath())
    if (!ignoreDependencies) {
      for (const dependant of stack.getDependants()) {
        for (const dependantPath of collectStacksToDeleteFromStack(
          dependant,
          ctx,
          ignoreDependencies,
        )) {
          stacksToDelete.push(dependantPath)
        }
      }
    }
  }

  return uniq(stacksToDelete)
}

const collectStacksToDeleteFromStackGroup = (
  stackGroup: StackGroup,
  ctx: ConfigContext,
  ignoreDependencies: boolean,
): StackPath[] => {
  const stacksToDelete = stackGroup.getStacks().reduce((all, s) => {
    return [
      ...all,
      ...collectStacksToDeleteFromStack(s.getPath(), ctx, ignoreDependencies),
    ]
  }, new Array<StackPath>())

  const childStacksToDelete = stackGroup.getChildren().reduce((all, sg) => {
    return [
      ...collectStacksToDeleteFromStackGroup(sg, ctx, ignoreDependencies),
      ...all,
    ]
  }, new Array<StackPath>())

  return uniq([...stacksToDelete, ...childStacksToDelete])
}

export const sortStacksForDeletion = (stacks: Stack[]): Stack[] =>
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

export const collectStacksToDelete = (
  ctx: ConfigContext,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
): Stack[] => {
  if (isStackGroupPath(commandPath)) {
    const stackGroup = ctx.getStackGroup(commandPath)
    if (!stackGroup) {
      return []
    }

    return collectStacksToDeleteFromStackGroup(
      stackGroup,
      ctx,
      ignoreDependencies,
    ).map(ctx.getStackByExactPath)
  }

  return collectStacksToDeleteFromStack(
    commandPath,
    ctx,
    ignoreDependencies,
  ).map(ctx.getStackByExactPath)
}

export const prepareDeleteContext = async (
  ctx: ConfigContext,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
): Promise<CommandContext> => {
  const { credentialProvider, options, variables, logger, templateEngine } = ctx

  logger.info("Prepare context")

  const stacksToDelete = collectStacksToDelete(
    ctx,
    commandPath,
    ignoreDependencies,
  )

  if (stacksToDelete.length === 0) {
    throw new CommandPathMatchesNoStacksError(commandPath, ctx.getStacks())
  }

  logger.debug(
    `Command path ${commandPath} matches ${stacksToDelete.length} stack(s)`,
  )

  const stacksToProcess = sortStacksForDeletion(stacksToDelete)

  await validateStackCredentialProvidersWithAllowedAccountIds(stacksToProcess)

  const [existingStacks, existingTemplateSummaries] = await Promise.all([
    loadExistingStacks(logger, stacksToProcess),
    loadExistingTemplateSummaries(logger, stacksToProcess),
  ])

  return new StdCommandContext({
    existingStacks,
    existingTemplateSummaries,
    stacksToProcess,
    credentialProvider,
    options,
    variables,
    logger,
    templateEngine,
    allStacks: ctx.getStacks(),
  })
}
