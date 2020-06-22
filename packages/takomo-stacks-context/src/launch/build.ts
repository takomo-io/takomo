import { CommandPath, StackPath, TakomoCredentialProvider } from "@takomo/core"
import { CommandContext, Stack, StackGroup } from "@takomo/stacks-model"
import { TakomoError } from "@takomo/util"
import uniq from "lodash.uniq"
import {
  isStackGroupPath,
  loadExistingStacks,
  loadExistingTemplateSummaries,
  validateStackCredentialProvidersWithAllowedAccountIds,
} from "../common"
import { ConfigContext } from "../config"
import { StdCommandContext } from "../model"

export class CommandPathMatchesNoStacksError extends TakomoError {
  constructor(commandPath: CommandPath, availableStacks: Stack[]) {
    const stackPaths = availableStacks
      .map((s) => `  - ${s.getPath()}`)
      .join("\n")

    super(
      `No stacks found within the given command path: ${commandPath}\n\nAvailable stack paths:\n\n${stackPaths}`,
    )
  }
}

const collectStacksToLaunchFromStack = (
  stackPath: StackPath,
  ctx: ConfigContext,
  ignoreDependencies: boolean,
): StackPath[] => {
  const stacksToLaunch = []
  for (const stack of ctx.getStacksByPath(stackPath)) {
    stacksToLaunch.push(stack.getPath())

    if (!ignoreDependencies) {
      for (const dependency of stack.getDependencies()) {
        for (const dependencyPath of collectStacksToLaunchFromStack(
          dependency,
          ctx,
          ignoreDependencies,
        )) {
          stacksToLaunch.push(dependencyPath)
        }
      }
    }
  }

  return uniq(stacksToLaunch)
}

const collectStacksToLaunchFromStackGroup = (
  stackGroup: StackGroup,
  ctx: ConfigContext,
  ignoreDependencies: boolean,
): StackPath[] => {
  const stacksToLaunch = stackGroup
    .getStacks()
    .reduce(
      (all, s) => [
        ...all,
        ...collectStacksToLaunchFromStack(s.getPath(), ctx, ignoreDependencies),
      ],
      new Array<StackPath>(),
    )

  const childStacksToLaunch = stackGroup
    .getChildren()
    .reduce(
      (all, sg) => [
        ...collectStacksToLaunchFromStackGroup(sg, ctx, ignoreDependencies),
        ...all,
      ],
      new Array<StackPath>(),
    )

  return uniq([...stacksToLaunch, ...childStacksToLaunch])
}

export const collectStacksToLaunch = (
  ctx: ConfigContext,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
): Stack[] => {
  if (isStackGroupPath(commandPath)) {
    const stackGroup = ctx.getStackGroup(commandPath)
    if (!stackGroup) {
      return []
    }

    return collectStacksToLaunchFromStackGroup(
      stackGroup,
      ctx,
      ignoreDependencies,
    ).map(ctx.getStackByExactPath)
  }

  return collectStacksToLaunchFromStack(
    commandPath,
    ctx,
    ignoreDependencies,
  ).map(ctx.getStackByExactPath)
}

export const sortStacksForLaunch = (stacks: Stack[]): Stack[] =>
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

export const prepareLaunchContext = async (
  ctx: ConfigContext,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
): Promise<CommandContext> => {
  const { credentialProvider, options, variables, logger, templateEngine } = ctx

  logger.info("Prepare context")

  const stacksToLaunch = collectStacksToLaunch(
    ctx,
    commandPath,
    ignoreDependencies,
  )

  if (stacksToLaunch.length === 0) {
    throw new CommandPathMatchesNoStacksError(commandPath, ctx.getStacks())
  }

  logger.debug(
    `Command path ${commandPath} matches ${stacksToLaunch.length} stack(s)`,
  )

  const credentialProviders = stacksToLaunch.reduce((collected, stack) => {
    if (
      collected.find(
        (c) => c.getName() === stack.getCredentialProvider().getName(),
      )
    ) {
      return collected
    }

    return [...collected, stack.getCredentialProvider()]
  }, new Array<TakomoCredentialProvider>())

  logger.debugObject(
    "Stacks chosen for deployment contain the following credential providers",
    credentialProviders.map((c) => c.getName()),
  )

  await Promise.all(credentialProviders.map(async (c) => c.getCallerIdentity()))

  const stacksToProcess = sortStacksForLaunch(stacksToLaunch)

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
