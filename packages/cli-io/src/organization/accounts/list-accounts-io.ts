import {
  ListAccountsIO,
  ListAccountsOutput,
} from "@takomo/organization-commands"
import { formatTimestamp } from "@takomo/util"
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
      table
        .cell("Id", a.id)
        .cell("Name", a.name)
        .cell("Email", a.email)
        .cell("Status", formatAccountStatus(a.status))
        .cell("Joined", formatTimestamp(a.joinedTimestamp))
        .newRow()
    })

    io.message({ text: table.toString(), marginTop: true })

    return output
  }

  return { ...logger, printOutput }
}
