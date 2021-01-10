import {
  ListAccountsIO,
  ListAccountsOutput,
} from "@takomo/organization-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import date from "date-and-time"
import Table from "easy-table"
import { createBaseIO } from "../../cli-io"
import { formatAccountStatus } from "../../formatters"

export const createListAccountsIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): ListAccountsIO => {
  const io = createBaseIO(writer)

  const printOutput = (output: ListAccountsOutput): ListAccountsOutput => {
    const table = new Table()

    output.accounts.forEach((a) => {
      table.cell("Id", a.id)
      table.cell("Name", a.name)
      table.cell("Email", a.email)
      table.cell("Status", formatAccountStatus(a.status))
      table.cell(
        "Joined",
        date.format(a.joinedTimestamp, "YYYY-MM-DD HH:mm:ss Z"),
      )
      table.newRow()
    })

    io.message({ text: table.toString(), marginTop: true })

    return output
  }

  return { ...logger, printOutput }
}
