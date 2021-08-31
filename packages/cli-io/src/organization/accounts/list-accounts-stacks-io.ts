import {
  ListAccountsStacksIO,
  ListAccountsStacksOutput,
} from "@takomo/organization-commands"
import { createBaseIO } from "../../cli-io"
import { IOProps } from "../../stacks/common"

export const createListAccountsStacksIO = (
  props: IOProps,
): ListAccountsStacksIO => {
  const { logger } = props
  const io = createBaseIO(props)

  const printOutput = (
    output: ListAccountsStacksOutput,
  ): ListAccountsStacksOutput => {
    io.message({ text: "ok" })

    return output
  }

  return { ...logger, printOutput }
}
