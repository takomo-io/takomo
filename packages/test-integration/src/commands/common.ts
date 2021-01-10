import { CliCommandContext, initCommandContext } from "@takomo/cli"
import { CommandPath } from "@takomo/stacks-model"
import { FilePath, LogLevel } from "@takomo/util"
import { Credentials } from "aws-sdk"
import { CreateCtxAndConfigRepositoryProps } from "./stacks"

export interface ExecuteCommandProps {
  readonly projectDir: FilePath
  readonly var?: string[]
  readonly varFile?: string[]
  readonly autoConfirmEnabled?: boolean
  readonly ignoreDependencies?: boolean
  readonly commandPath?: CommandPath
  readonly logLevel?: LogLevel
}

export const createTestCommandContext = async (
  props: CreateCtxAndConfigRepositoryProps,
): Promise<CliCommandContext> => {
  const credentials = global.reservation
    ? new Credentials(global.reservation.credentials)
    : undefined

  const vars = global.reservation
    ? global.reservation.accounts.map(
        (slot, index) => `ACCOUNT_${index + 1}_ID=${slot.accountId}`,
      )
    : []

  return initCommandContext(
    {
      dir: props.projectDir,
      var: [...vars, ...props.var],
      "var-file": props.varFile,
      log: props.logLevel,
      yes: props.autoConfirmEnabled,
      "ignore-dependencies": props.ignoreDependencies,
    },
    credentials,
  )
}
