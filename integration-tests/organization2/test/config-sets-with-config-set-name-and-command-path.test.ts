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

const projectDir = "configs/config-sets-with-config-set-name-and-command-path"

beforeAll(() =>
  executeDeployOrganizationCommand({ projectDir })
    .expectCommandToSucceed()
    .assert(),
)

describe("Config sets with config set name and command path", () => {
  test("Deploy with config set name", () =>
    executeDeployAccountsCommand({
      projectDir,
      configSetName: "other",
    })
      .expectCommandToSucceed()
      .expectResults({
        organizationalUnitPath: "Root/Two",
        accountResults: [
          {
            accountId: ORG_3_ACCOUNT_02_ID,
            configSetResults: [
              {
                configSet: "other",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [
                      {
                        stackPath: "/another-logs.yml/eu-west-1",
                        stackName: "another-logs",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            accountId: ORG_3_ACCOUNT_03_ID,
            configSetResults: [
              {
                configSet: "other",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [
                      {
                        stackPath: "/another-logs.yml/eu-west-1",
                        stackName: "another-logs",
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

  test("Deploy with config set name and command path", () =>
    executeDeployAccountsCommand({
      projectDir,
      configSetName: "logs",
      commandPath: "/logs-2.yml",
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
                  configSet: "logs",
                  commandPathResults: [
                    {
                      commandPath: "/logs-2.yml",
                      stackResults: [
                        {
                          stackPath: "/logs-2.yml/eu-west-1",
                          stackName: "logs-2",
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
                      commandPath: "/logs-2.yml",
                      stackResults: [
                        {
                          stackPath: "/logs-2.yml/eu-west-1",
                          stackName: "logs-2",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              accountId: ORG_3_ACCOUNT_03_ID,
              configSetResults: [
                {
                  configSet: "logs",
                  commandPathResults: [
                    {
                      commandPath: "/logs-2.yml",
                      stackResults: [
                        {
                          stackPath: "/logs-2.yml/eu-west-1",
                          stackName: "logs-2",
                        },
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
                  configSet: "logs",
                  commandPathResults: [
                    {
                      commandPath: "/",
                      stackResults: [
                        {
                          stackPath: "/logs-1.yml/eu-west-1",
                          stackName: "logs-1",
                        },
                        {
                          stackPath: "/logs-2.yml/eu-west-1",
                          stackName: "logs-2",
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
                  configSet: "other",
                  commandPathResults: [
                    {
                      commandPath: "/",
                      stackResults: [
                        {
                          stackPath: "/another-logs.yml/eu-west-1",
                          stackName: "another-logs",
                        },
                      ],
                    },
                  ],
                },
                {
                  configSet: "logs",
                  commandPathResults: [
                    {
                      commandPath: "/",
                      stackResults: [
                        {
                          stackPath: "/logs-1.yml/eu-west-1",
                          stackName: "logs-1",
                        },
                        {
                          stackPath: "/logs-2.yml/eu-west-1",
                          stackName: "logs-2",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              accountId: ORG_3_ACCOUNT_03_ID,
              configSetResults: [
                {
                  configSet: "other",
                  commandPathResults: [
                    {
                      commandPath: "/",
                      stackResults: [
                        {
                          stackPath: "/another-logs.yml/eu-west-1",
                          stackName: "another-logs",
                        },
                      ],
                    },
                  ],
                },
                {
                  configSet: "logs",
                  commandPathResults: [
                    {
                      commandPath: "/",
                      stackResults: [
                        {
                          stackPath: "/logs-1.yml/eu-west-1",
                          stackName: "logs-1",
                        },
                        {
                          stackPath: "/logs-2.yml/eu-west-1",
                          stackName: "logs-2",
                        },
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
