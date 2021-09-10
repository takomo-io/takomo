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

const projectDir = "configs/config-sets-with-stages"

beforeAll(() =>
  executeDeployOrganizationCommand({ projectDir })
    .expectCommandToSucceed()
    .assert(),
)
describe("Config sets with stages", () => {
  test("Deploy", () =>
    executeDeployAccountsCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectResults(
        {
          stageName: "first",
          organizationalUnitResults: [
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
                            {
                              stackPath: "/logs.yml/eu-west-1",
                              stackName: "logs",
                            },
                          ],
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
          stageName: "second",
          organizationalUnitResults: [
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
                              stackPath: "/logs.yml/eu-west-1",
                              stackName: "logs",
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
              organizationalUnitPath: "Root/Three",
              accountResults: [
                {
                  accountId: ORG_3_ACCOUNT_03_ID,
                  configSetResults: [
                    {
                      configSet: "logs",
                      commandPathResults: [
                        {
                          commandPath: "/",
                          stackResults: [
                            {
                              stackPath: "/logs.yml/eu-west-1",
                              stackName: "logs",
                            },
                          ],
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

  test("Deploy single OU", () =>
    executeDeployAccountsCommand({
      projectDir,
      organizationalUnits: ["Root/Three"],
    })
      .expectCommandToSucceed()
      .expectResults({
        stageName: "second",
        organizationalUnitResults: [
          {
            organizationalUnitPath: "Root/Three",
            accountResults: [
              {
                accountId: ORG_3_ACCOUNT_03_ID,
                configSetResults: [
                  {
                    configSet: "logs",
                    commandPathResults: [
                      {
                        commandPath: "/",
                        stackResults: [
                          {
                            stackPath: "/logs.yml/eu-west-1",
                            stackName: "logs",
                          },
                        ],
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
          stageName: "first",
          organizationalUnitResults: [
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
                            {
                              stackPath: "/logs.yml/eu-west-1",
                              stackName: "logs",
                            },
                          ],
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
          stageName: "second",
          organizationalUnitResults: [
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
                              stackPath: "/logs.yml/eu-west-1",
                              stackName: "logs",
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
              organizationalUnitPath: "Root/Three",
              accountResults: [
                {
                  accountId: ORG_3_ACCOUNT_03_ID,
                  configSetResults: [
                    {
                      configSet: "logs",
                      commandPathResults: [
                        {
                          commandPath: "/",
                          stackResults: [
                            {
                              stackPath: "/logs.yml/eu-west-1",
                              stackName: "logs",
                            },
                          ],
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
