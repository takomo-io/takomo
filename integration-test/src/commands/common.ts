import { StackName } from "../../../src/aws/cloudformation/model.js"
import { initCommandContext } from "../../../src/cli/index.js"
import { CommandPath } from "../../../src/command/command-model.js"
import { StackPath } from "../../../src/stacks/stack.js"
import { FileSystemCommandContext } from "../../../src/takomo-config-repository-fs/context/create-file-system-command-context.js"
import { CommandStatus } from "../../../src/takomo-core/command.js"
import { FilePath } from "../../../src/utils/files.js"
import { LogLevel } from "../../../src/utils/logging.js"
import { getReservation } from "../reservations.js"
import { CreateCtxAndConfigRepositoryProps } from "./stacks.js"

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
  const reservation = getReservation()
  const credentials = reservation ? reservation.credentials : undefined

  const vars = reservation
    ? reservation.accounts.map(
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
