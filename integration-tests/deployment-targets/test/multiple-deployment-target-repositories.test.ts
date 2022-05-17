import {
  executeWithCli,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const projectDir = "configs/multiple-deployment-target-repositories"

describe("multiple deployment target repositories", () => {
  test(
    "targets are loaded correctly",
    withSingleAccountReservation(async ({ accountId }) => {
      const expected = [
        {
          deploymentGroupPath: "sandbox",
          bootstrapConfigSets: [],
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
          bootstrapConfigSets: [],
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
          bootstrapConfigSets: [],
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
          bootstrapConfigSets: [],
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
        `./bin/tkm targets run \
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
