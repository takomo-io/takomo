import {
  ConfirmDeployAnswer,
  ConfirmStackDeployAnswer,
  DeployStacksIO,
} from "../../../command/stacks/deploy/model.js"
import { StacksOperationOutput } from "../../../command/stacks/model.js"
import { StackGroup } from "../../../stacks/stack-group.js"
import { createBaseIO } from "../../cli-io.js"
import {
  chooseCommandPathInternal,
  createStacksOperationListenerInternal,
  IOProps,
} from "../common.js"

export type EmitStackTemplatesIOProps = IOProps

export const createEmitStackTemplatesIO = (
  props: EmitStackTemplatesIOProps,
): DeployStacksIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const confirmDeploy = async (): Promise<ConfirmDeployAnswer> => {
    return "CONTINUE_NO_REVIEW"
  }

  const printOutput = (
    output: StacksOperationOutput,
  ): StacksOperationOutput => {
    output.results.forEach((result) => {
      io.message({ text: String(result.templateBody), marginTop: true })
    })

    return output
  }

  const confirmStackDeploy = async (): Promise<ConfirmStackDeployAnswer> => {
    return "CONTINUE"
  }

  const printStackEvent = (): void => {}

  const chooseCommandPath = (rootStackGroup: StackGroup) =>
    chooseCommandPathInternal(io, rootStackGroup)

  const createStacksOperationListener = (stackCount: number) =>
    createStacksOperationListenerInternal(logger, "emit", stackCount)

  return {
    ...logger,
    ...io,
    chooseCommandPath,
    confirmDeploy,
    confirmStackDeploy,
    printOutput,
    printStackEvent,
    createStacksOperationListener,
  }
}
