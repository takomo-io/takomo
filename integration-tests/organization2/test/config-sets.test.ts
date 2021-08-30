import {
  executeDeployAccountsCommand,
  executeDeployOrganizationCommand,
  executeUndeployAccountsCommand,
} from "@takomo/test-integration"
import {
  ORG_3_ACCOUNT_01_ID,
  ORG_3_ACCOUNT_02_ID,
  ORG_3_ACCOUNT_03_ID,
} from "./env"

const projectDir = "configs/config-sets"

beforeAll(() =>
  executeDeployOrganizationCommand({ projectDir })
    .expectCommandToSucceed()
    .assert(),
)

describe("Config sets", () => {
  test("Legacy config sets with single command path", () =>
    executeDeployAccountsCommand({
      projectDir,
      organizationalUnits: ["Root/One"],
    })
      .expectCommandToSucceed()
      .expectResults({
        organizationalUnitPath: "Root/One",
        accountResults: [
          {
            accountId: ORG_3_ACCOUNT_01_ID,
            configSetResults: [
              {
                configSet: "legacySingle",
                commandPathResults: [
                  {
                    commandPath: "/a.yml",
                    stackResults: [
                      { stackPath: "/a.yml/eu-west-1", stackName: "a" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
      .assert())

  test("New config sets", () =>
    executeDeployAccountsCommand({
      projectDir,
      organizationalUnits: ["Root/Two"],
    })
      .expectCommandToSucceed()
      .expectResults({
        organizationalUnitPath: "Root/Two",
        accountResults: [
          {
            accountId: ORG_3_ACCOUNT_02_ID,
            configSetResults: [
              {
                configSet: "logs",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [
                      { stackPath: "/logs.yml/eu-west-1", stackName: "logs" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
      .assert())

  test("New config set with extra configuration", () =>
    executeDeployAccountsCommand({
      projectDir,
      organizationalUnits: ["Root/Three"],
    })
      .expectCommandToSucceed()
      .expectResults({
        organizationalUnitPath: "Root/Three",
        accountResults: [
          {
            accountId: ORG_3_ACCOUNT_03_ID,
            configSetResults: [
              {
                configSet: "network",
                commandPathResults: [
                  {
                    commandPath: "/network2.yml",
                    stackResults: [
                      {
                        stackPath: "/network2.yml/eu-west-1",
                        stackName: "network2",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployAccountsCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectResults(
        {
          organizationalUnitPath: "Root/One",
          accountResults: [
            {
              accountId: ORG_3_ACCOUNT_01_ID,
              configSetResults: [
                {
                  configSet: "legacySingle",
                  commandPathResults: [
                    {
                      commandPath: "/a.yml",
                      stackResults: [
                        { stackPath: "/a.yml/eu-west-1", stackName: "a" },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          organizationalUnitPath: "Root/Three",
          accountResults: [
            {
              accountId: ORG_3_ACCOUNT_03_ID,
              configSetResults: [
                {
                  configSet: "network",
                  commandPathResults: [
                    {
                      commandPath: "/network2.yml",
                      stackResults: [
                        {
                          stackPath: "/network2.yml/eu-west-1",
                          stackName: "network2",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          organizationalUnitPath: "Root/Two",
          accountResults: [
            {
              accountId: ORG_3_ACCOUNT_02_ID,
              configSetResults: [
                {
                  configSet: "logs",
                  commandPathResults: [
                    {
                      commandPath: "/",
                      stackResults: [
                        { stackPath: "/logs.yml/eu-west-1", stackName: "logs" },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      )
      .assert())
})
