import { executeWithCli } from "../../src/cli/execute.js"
import { withSingleAccountReservation } from "../../src/reservations.js"

const projectDir = `${process.cwd()}/integration-test/configs/deployment-targets/multiple-deployment-target-repositories`

describe("multiple deployment target repositories", () => {
  test(
    "targets are loaded correctly",
    withSingleAccountReservation(async ({ accountId }) => {
      const expected = [
        {
          deploymentGroupPath: "sandbox",
          configSets: [],
          labels: [],
          name: "a",
          status: "active",
          vars: {
            ACCOUNT_1_ID: accountId,
          },
        },
        {
          deploymentGroupPath: "sandbox",
          configSets: [],
          labels: [],
          name: "b",
          status: "active",
          vars: {
            ACCOUNT_1_ID: accountId,
          },
        },
        {
          deploymentGroupPath: "workload/development",
          configSets: [],
          labels: [],
          name: "d",
          status: "active",
          vars: {
            ACCOUNT_1_ID: accountId,
          },
        },
        {
          deploymentGroupPath: "workload/production",
          configSets: [],
          labels: ["foobar", "fuzz"],
          name: "c",
          status: "active",
          vars: {
            ACCOUNT_1_ID: accountId,
          },
        },
      ]

      await executeWithCli(
        `node bin/tkm.mjs targets run \
      --disable-map-role \
      --quiet \
      --yes \
      --output json \
      --reduce js:reduce.js \
      --map js:map.js \
      -d ${projectDir}`,
      )
        .expectJson(expected)
        .assert()
    }),
  )
})
