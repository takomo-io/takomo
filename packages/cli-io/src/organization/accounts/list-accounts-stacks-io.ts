import {
  ListAccountsStacksIO,
  ListAccountsStacksOutput,
} from "@takomo/organization-commands"
import { ListStacksIO } from "@takomo/stacks-commands"
import { TkmLogger } from "@takomo/util"
import Table from "easy-table"
import R from "ramda"
import { createBaseIO } from "../../cli-io"
import { printError } from "../../common"
import { createTargetListenerInternal } from "../../config-set/target-listener"
import { formatStackStatus } from "../../formatters"
import { formatDate, IOProps } from "../../stacks/common"
import { createListStacksIO } from "../../stacks/list-stacks-io"

export const createListAccountsStacksIO = (
  props: IOProps,
): ListAccountsStacksIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printOutput = (
    output: ListAccountsStacksOutput,
  ): ListAccountsStacksOutput => {
    const {} = output

    io.header({ text: "Stacks", marginTop: true })

    if (output.error) {
      io.message({ marginTop: true, text: "An unhandled error occurred:" })
      printError(io, output.error, logger.logLevel, 0)
    }

    if (output.results.length === 0) {
      io.message({ text: "No stacks found", marginTop: true })
      return output
    }

    const targetsTable = new Table()

    output.results.forEach((stage) => {
      stage.results.forEach((group) => {
        group.results.forEach((target) => {
          target.results.forEach((configSet) => {
            configSet.results.forEach((commandPathResult) => {
              if (commandPathResult.result.results.length === 0) {
                return
              }

              commandPathResult.result.results.forEach((stackResult) => {
                targetsTable
                  .cell("stage", stage.stageName)
                  .cell("OU", group.groupId)
                  .cell("Account", target.targetId)
                  .cell("Config set", configSet.configSetName)
                  .cell("Command path", commandPathResult.commandPath)
                  .cell("Path", stackResult.path)
                  .cell("Name", stackResult.name)
                  .cell("Status", formatStackStatus(stackResult.status))
                  .cell("Created", formatDate(stackResult.createdTime))
                  .cell("Updated", formatDate(stackResult.updatedTime))
                  .newRow()
              })
            })
          })
        })
      })
    })

    io.message({ text: targetsTable.toString(), marginTop: true })

    return output
  }

  const doCreateListStacksIO = (logger: TkmLogger): ListStacksIO =>
    createListStacksIO({ logger, hideOutput: true })

  const createTargetListener = R.curry(createTargetListenerInternal)(
    "ou",
    "accounts",
    logger,
  )

  return {
    ...logger,
    printOutput,
    createTargetListener,
    createListStacksIO: doCreateListStacksIO,
  }
}
