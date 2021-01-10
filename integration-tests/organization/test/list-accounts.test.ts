import { executeListAccountsCommand } from "@takomo/test-integration/src"
import {
  ORG_A_ACCOUNT_1_ID,
  ORG_A_ACCOUNT_2_ID,
  ORG_A_ACCOUNT_3_ID,
  ORG_A_ACCOUNT_4_ID,
  ORG_A_ACCOUNT_5_ID,
  ORG_A_MASTER_ACCOUNT_ID,
} from "./env"

describe("List accounts command", () => {
  it("returns correct output", async () => {
    const { accounts, masterAccountId } = await executeListAccountsCommand({
      projectDir: "configs",
      var: [`configVersion=v01.yml`],
    })
      .expectCommandToSucceed()
      .assert()

    expect(
      accounts
        .map((a) => a.id)
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
