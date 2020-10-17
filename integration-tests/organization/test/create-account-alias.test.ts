import { CliCreateAliasIO, CliDeleteAliasIO } from "@takomo/cli-io"
import { initOptionsAndVariables } from "@takomo/cli/src"
import { CommandStatus } from "@takomo/core"
import {
  createAliasCommand,
  deleteAliasCommand,
} from "@takomo/organization-commands"
import { ORG_A_ACCOUNT_2_ID } from "./env"

const createOptions = async (version: string) =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs",
    var: `configVersion=${version}.yml`,
  })

describe("Account alias", () => {
  test("create account alias", async () => {
    const { options, variables, watch } = await createOptions("v01")
    const alias1 = `takomo-testing1-${Date.now()}`
    const alias2 = `takomo-testing2-${Date.now()}`
    const result1 = await createAliasCommand(
      {
        accountId: ORG_A_ACCOUNT_2_ID,
        alias: alias1,
        options,
        watch,
        variables,
      },
      new CliCreateAliasIO(options),
    )
    expect(result1.status).toBe(CommandStatus.SUCCESS)

    const result2 = await createAliasCommand(
      {
        accountId: ORG_A_ACCOUNT_2_ID,
        alias: alias2,
        options,
        watch,
        variables,
      },
      new CliCreateAliasIO(options),
    )

    expect(result2.status).toBe(CommandStatus.SUCCESS)
  })
  test("delete account alias", async () => {
    const { options, variables, watch } = await createOptions("v01")
    const result = await deleteAliasCommand(
      {
        accountId: ORG_A_ACCOUNT_2_ID,
        options,
        watch,
        variables,
      },
      new CliDeleteAliasIO(options),
    )

    expect(result.status).toBe(CommandStatus.SUCCESS)
  })
})
