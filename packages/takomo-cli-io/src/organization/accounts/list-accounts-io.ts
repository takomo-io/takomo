import { Options } from "@takomo/core"
import { ListAccountsIO, ListAccountsOutput } from "@takomo/organization"
import date from "date-and-time"
import Table from "easy-table"
import CliIO from "../../cli-io"
import { formatAccountStatus } from "../../formatters"

export class CliListAccountsIO extends CliIO implements ListAccountsIO {
  constructor(options: Options) {
    super(options)
  }

  printOutput = (output: ListAccountsOutput): ListAccountsOutput => {
    const table = new Table()

    output.accounts.forEach(a => {
      table.cell("Id", a.Id)
      table.cell("Name", a.Name)
      table.cell("Email", a.Email)
      table.cell("Status", formatAccountStatus(a.Status!))
      table.cell(
        "Joined",
        date.format(a.JoinedTimestamp!, "YYYY-MM-DD HH:mm:ss Z"),
      )
      table.newRow()
    })

    this.message(table.toString(), true)

    return output
  }
}
