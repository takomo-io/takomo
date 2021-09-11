import { TargetExecutorProps } from "@takomo/config-sets"
import { OutputFormat } from "@takomo/core"
import {
  OrganizationConfigRepository,
  OrganizationContext,
} from "@takomo/organization-context"
import { listStacksCommand, ListStacksOutput } from "@takomo/stacks-commands"
import { deepCopy } from "@takomo/util"
import { PlannedOrganizationAccount } from "../common/plan"
import { ListAccountsStacksIO } from "./model"

interface CreateExecutorProps {
  readonly outputFormat: OutputFormat
  readonly configRepository: OrganizationConfigRepository
  readonly ctx: OrganizationContext
  readonly io: ListAccountsStacksIO
}

export const createExecutor = ({
  outputFormat,
  configRepository,
  ctx,
  io,
}: CreateExecutorProps) => {
  return async ({
    timer,
    logger,
    state,
    commandPath,
    configSet,
    target,
    defaultCredentialManager,
  }: TargetExecutorProps<PlannedOrganizationAccount>): Promise<ListStacksOutput> => {
    if (state.failed) {
      logger.debug("Cancel operation")
      timer.stop()

      return {
        outputFormat,
        timer,
        status: "CANCELLED",
        message: "Cancelled",
        success: false,
        results: [],
      }
    }

    try {
      const input = {
        outputFormat,
        timer,
        commandPath,
        ignoreDependencies: false,
        interactive: false,
      }

      const stacksConfigRepository =
        await configRepository.createStacksConfigRepository(
          configSet.name,
          configSet.legacy,
        )

      const variables = {
        env: ctx.variables.env,
        var: deepCopy(target.vars),
        context: ctx.variables.context,
      }

      const credentialManager =
        await defaultCredentialManager.createCredentialManagerForRole(
          target.data.executionRoleArn,
        )

      return await listStacksCommand({
        input,
        credentialManager,
        ctx: {
          ...ctx.commandContext,
          variables,
        },
        io: io.createListStacksIO(io),
        configRepository: stacksConfigRepository,
      })
    } catch (error) {
      logger.error("An error occurred", error)
      timer.stop()

      return {
        error,
        outputFormat,
        timer,
        status: "FAILED",
        message: "Failed",
        success: false,
        results: [],
      }
    }
  }
}
