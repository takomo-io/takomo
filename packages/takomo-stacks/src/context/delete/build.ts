import { CommandPath, StackPath } from "@takomo/core"
import { TakomoError } from "@takomo/util"
import uniq from "lodash.uniq"
import { CommandPathMatchesNoStacksError } from "../../errors"
import { Stack, StackGroup } from "../../model"
import { isStackGroupPath } from "../common"
import { ConfigContext } from "../config"
import { collectAllDependants } from "../dependencies"
import { CommandContext, StdCommandContext } from "../model"

export const validateStackCredentialProvidersWithAllowedAccountIds = async (
  stacks: Stack[],
): Promise<void> => {
  const stacksWithIdentities = await Promise.all(
    stacks.map(async (stack) => {
      const identity = await stack.getCredentialProvider().getCallerIdentity()
      return { stack, identity }
    }),
  )

  stacksWithIdentities.forEach(({ stack, identity }) => {
    if (
      stack.getAccountIds().length > 0 &&
      !stack.getAccountIds().includes(identity.accountId)
    ) {
      const allowedAccountIds = stack
        .getAccountIds()
        .map((a) => `- ${a}`)
        .join("\n")
      throw new TakomoError(
        `Credentials associated with the stack ${stack.getPath()} point to an AWS account with id ${
          identity.accountId
        } which is not allowed in stack configuration.\n\nList of allowed account ids:\n\n${allowedAccountIds}`,
      )
    }
  })
}

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

  const stacksToDelete = collectStacksToDelete(
    ctx,
    commandPath,
    ignoreDependencies,
  )

  if (stacksToDelete.length === 0) {
    throw new CommandPathMatchesNoStacksError(commandPath, ctx.getStacks())
  }

  const stacksToProcess = sortStacksForDeletion(stacksToDelete)

  await validateStackCredentialProvidersWithAllowedAccountIds(stacksToProcess)

  return new StdCommandContext({
    stacksToProcess,
    credentialProvider,
    options,
    variables,
    logger,
    templateEngine,
    allStacks: ctx.getStacks(),
  })
}
