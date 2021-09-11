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
import { formatStackStatus } from "../../formatters"
import { formatDate, IOProps } from "../../stacks/common"
import { createListStacksIO } from "../../stacks/list-stacks-io"
import { createTargetListenerInternal } from "./common"

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
                targetsTable.cell("stage", stage.stageName)
                targetsTable.cell("OU", group.groupId)
                targetsTable.cell("Account", target.targetId)
                targetsTable.cell("Config set", configSet.configSetName)
                targetsTable.cell("Command path", commandPathResult.commandPath)
                targetsTable.cell("Path", stackResult.path)
                targetsTable.cell("Name", stackResult.name)
                targetsTable.cell(
                  "Status",
                  formatStackStatus(stackResult.status),
                )
                targetsTable.cell(
                  "Created",
                  formatDate(stackResult.createdTime),
                )
                targetsTable.cell(
                  "Updated",
                  formatDate(stackResult.updatedTime),
                )
                targetsTable.newRow()
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

  const createTargetListener = R.curry(createTargetListenerInternal)(logger)

  return {
    ...logger,
    printOutput,
    createTargetListener,
    createListStacksIO: doCreateListStacksIO,
  }
}
