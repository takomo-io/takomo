import { initOptionsAndVariables } from "@takomo/cli"
import { CliListAccountsIO } from "@takomo/cli-io"
import { CommandStatus } from "@takomo/core"
import { listAccountsCommand } from "@takomo/organization-commands"
import {
  ORG_A_ACCOUNT_1_ID,
  ORG_A_ACCOUNT_2_ID,
  ORG_A_ACCOUNT_3_ID,
  ORG_A_ACCOUNT_4_ID,
  ORG_A_ACCOUNT_5_ID,
  ORG_A_MASTER_ACCOUNT_ID,
} from "./env"

const createOptions = async (version: string) =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs",
    var: `configVersion=${version}.yml`,
  })

describe("List accounts command", () => {
  it("returns correct output", async () => {
    const { options, variables, watch } = await createOptions("v01")
    const output = await listAccountsCommand(
      {
        watch,
        variables,
        options,
      },
      new CliListAccountsIO(options),
    )

    const { status, success, message, accounts, masterAccountId } = output

    expect(success).toBeTruthy()
    expect(status).toBe(CommandStatus.SUCCESS)
    expect(message).toBe("Success")

    expect(
      accounts
        .map((a) => a.Id)
        .slice()
        .sort(),
    ).toStrictEqual(
      [
        ORG_A_MASTER_ACCOUNT_ID,
        ORG_A_ACCOUNT_1_ID,
        ORG_A_ACCOUNT_2_ID,
        ORG_A_ACCOUNT_3_ID,
        ORG_A_ACCOUNT_4_ID,
        ORG_A_ACCOUNT_5_ID,
      ]
        .slice()
        .sort(),
    )

    expect(masterAccountId).toBe(ORG_A_MASTER_ACCOUNT_ID)
  })
})
