import { CommandPath } from "@takomo/core"
import { CommandContext } from "@takomo/stacks-model"
import {
  loadExistingStacks,
  loadExistingTemplateSummaries,
  validateStackCredentialProvidersWithAllowedAccountIds,
} from "../common"
import { ConfigContext } from "../config/config-context"
import { sortStacksForDeploy } from "../dependencies"
import { CommandPathMatchesNoStacksError, StdCommandContext } from "../model"
import { collectCredentialProviders } from "./collect-credential-providers"
import { collectStacksToDeploy } from "./collect-stacks-to-deploy"

export const prepareDeployContext = async (
  ctx: ConfigContext,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
): Promise<CommandContext> => {
  const { credentialProvider, options, variables, logger, templateEngine } = ctx

  logger.info("Prepare context")

  const stacksToDeploy = collectStacksToDeploy(
    ctx,
    commandPath,
    ignoreDependencies,
  )

  if (stacksToDeploy.length === 0) {
    throw new CommandPathMatchesNoStacksError(
      commandPath,
      ctx.getStacks().map((s) => s.getPath()),
    )
  }

  logger.debug(
    `Command path ${commandPath} matches ${stacksToDeploy.length} stack(s)`,
  )

  const credentialProviders = collectCredentialProviders(stacksToDeploy)

  logger.debugObject(
    "Stacks chosen for deployment contain the following credential providers",
    credentialProviders.map((c) => c.getName()),
  )

  await Promise.all(credentialProviders.map(async (c) => c.getCallerIdentity()))

  const stacksToProcess = ignoreDependencies
    ? stacksToDeploy
    : sortStacksForDeploy(stacksToDeploy)

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
