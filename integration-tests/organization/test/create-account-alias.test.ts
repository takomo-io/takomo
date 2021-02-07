import {
  executeCreateAccountAliasCommand,
  executeDeleteAccountAliasCommand,
} from "@takomo/test-integration"
import { ORG_A_ACCOUNT_2_ID } from "./env"

describe("Account alias", () => {
  test("create account alias", async () => {
    const alias1 = `takomo-testing1-${Date.now()}`
    const alias2 = `takomo-testing2-${Date.now()}`

    await executeCreateAccountAliasCommand({
      projectDir: "configs",
      alias: alias1,
      accountId: ORG_A_ACCOUNT_2_ID,
      var: [`configVersion=v01.yml`],
    })
      .expectCommandToSucceed()
      .assert()

    await executeCreateAccountAliasCommand({
      projectDir: "configs",
      alias: alias2,
      accountId: ORG_A_ACCOUNT_2_ID,
      var: [`configVersion=v01.yml`],
    })
      .expectCommandToSucceed()
      .assert()
  })

  test("delete account alias", () =>
    executeDeleteAccountAliasCommand({
      projectDir: "configs",
      accountId: ORG_A_ACCOUNT_2_ID,
      var: [`configVersion=v01.yml`],
    })
      .expectCommandToSucceed()
      .assert())
})
