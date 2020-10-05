import { CommandPath } from "@takomo/core"
import { CommandContext } from "@takomo/stacks-model"
import {
  loadExistingStacks,
  loadExistingTemplateSummaries,
  validateStackCredentialProvidersWithAllowedAccountIds,
} from "../common"
import { ConfigContext } from "../config/config-context"
import { sortStacksForUndeploy } from "../dependencies"
import { CommandPathMatchesNoStacksError, StdCommandContext } from "../model"
import { collectStacksToUndeploy } from "./collect-stacks-to-undeploy"

export const prepareUndeployContext = async (
  ctx: ConfigContext,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
): Promise<CommandContext> => {
  const { credentialProvider, options, variables, logger, templateEngine } = ctx

  logger.info("Prepare context")

  const stacksToUndeploy = collectStacksToUndeploy(
    ctx,
    commandPath,
    ignoreDependencies,
  )

  if (stacksToUndeploy.length === 0) {
    throw new CommandPathMatchesNoStacksError(commandPath, ctx.getStacks())
  }

  logger.debug(
    `Command path ${commandPath} matches ${stacksToUndeploy.length} stack(s)`,
  )

  const stacksToProcess = ignoreDependencies
    ? stacksToUndeploy
    : sortStacksForUndeploy(stacksToUndeploy)

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
