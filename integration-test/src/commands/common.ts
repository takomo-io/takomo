import { CommandPath } from "../../../src/command/command-model"
import { StackPath } from "../../../src/stacks/stack"
import { StackName } from "../../../src/takomo-aws-model"
import { initCommandContext } from "../../../src/takomo-cli"
import { FileSystemCommandContext } from "../../../src/takomo-config-repository-fs"
import { CommandStatus } from "../../../src/takomo-core/command"
import { FilePath } from "../../../src/utils/files"
import { LogLevel } from "../../../src/utils/logging"
import { CustomNodeJsGlobal } from "../global"
import { CreateCtxAndConfigRepositoryProps } from "./stacks"

// Make references to global namespace work
declare const global: CustomNodeJsGlobal

export interface ExecuteCommandProps {
  readonly projectDir: FilePath
  readonly var?: string[]
  readonly varFile?: string[]
  readonly autoConfirmEnabled?: boolean
  readonly ignoreDependencies?: boolean
  readonly commandPath?: CommandPath
  readonly logLevel?: LogLevel
  readonly feature?: string[]
}

export const createTestCommandContext = async (
  props: CreateCtxAndConfigRepositoryProps,
): Promise<FileSystemCommandContext> => {
  const credentials = global.reservation
    ? global.reservation.credentials
    : undefined

  const vars = global.reservation
    ? global.reservation.accounts.map(
        (slot, index) => `ACCOUNT_${index + 1}_ID=${slot.id}`,
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
      feature: props.feature,
    },
    credentials,
  )
}

export interface ExpectedStackResult {
  readonly stackPath: StackPath
  readonly stackName: StackName
  readonly status: CommandStatus
  readonly success: boolean
  readonly message: string
}

type StackOperationSucceededProps = Pick<
  ExpectedStackResult,
  "stackPath" | "stackName" | "message"
>
type StackSucceededProps = Pick<ExpectedStackResult, "stackPath" | "stackName">

const stackOperationSucceeded = ({
  stackPath,
  stackName,
  message,
}: StackOperationSucceededProps): ExpectedStackResult => ({
  stackPath,
  stackName,
  message,
  status: "SUCCESS",
  success: true,
})

export const stackCreateSucceeded = (
  props: StackSucceededProps,
): ExpectedStackResult =>
  stackOperationSucceeded({
    ...props,
    message: "Stack create succeeded",
  })

export const stackDeleteSucceeded = (
  props: StackSucceededProps,
): ExpectedStackResult =>
  stackOperationSucceeded({
    ...props,
    message: "Stack delete succeeded",
  })

export const stackUpdateSucceeded = (
  props: StackSucceededProps,
): ExpectedStackResult =>
  stackOperationSucceeded({
    ...props,
    message: "Stack delete succeeded",
  })
