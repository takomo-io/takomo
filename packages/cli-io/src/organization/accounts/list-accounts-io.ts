import {
  ListAccountsIO,
  ListAccountsOutput,
} from "@takomo/organization-commands"
import date from "date-and-time"
import Table from "easy-table"
import { createBaseIO } from "../../cli-io"
import { formatAccountStatus } from "../../formatters"
import { IOProps } from "../../stacks/common"

export const createListAccountsIO = (props: IOProps): ListAccountsIO => {
  const { logger } = props
  const io = createBaseIO(props)

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
