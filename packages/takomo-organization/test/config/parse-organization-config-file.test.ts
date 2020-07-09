import { Options } from "@takomo/core"
import { ConsoleLogger, LogLevel, TemplateEngine } from "@takomo/util"
import { parseOrganizationConfigFile } from "../../src/config/parser"
import {
  OrganizationAccount,
  OrganizationAccountStatus,
  OrganizationConfigFile,
} from "../../src/model"

const logger = new ConsoleLogger(LogLevel.TRACE)
const templateEngine = new TemplateEngine()
const options = new Options({
  logConfidentialInfo: false,
  autoConfirm: false,
  logLevel: LogLevel.TRACE,
  projectDir: "",
  stats: false,
})

const parse = async (
  pathToConfigFile: string,
): Promise<OrganizationConfigFile> =>
  parseOrganizationConfigFile(
    logger,
    options,
    {},
    pathToConfigFile,
    templateEngine,
  )

interface CreateAccountProps {
  id: string
  serviceControlPolicies?: string[]
}

const account = ({
  id,
  serviceControlPolicies,
}: CreateAccountProps): OrganizationAccount => ({
  id,
  accountAdminRoleName: null,
  accountBootstrapRoleName: null,
  bootstrapConfigSets: [],
  configSets: [],
  description: null,
  email: null,
  name: null,
  serviceControlPolicies: serviceControlPolicies || [],
  aiServicesOptOutPolicies: [],
  status: OrganizationAccountStatus.ACTIVE,
  tagPolicies: [],
  vars: {},
})

describe("#parseOrganizationConfigFile", () => {
  describe("when parsing a minimum organization config", () => {
    test("returns correct configuration", async () => {
      const o = await parse("./test/config/minimum-org-config.yml")

      expect(o).toStrictEqual({
        masterAccountId: "123456789012",
        accountCreation: {
          constraints: {
            emailPattern: null,
            namePattern: null,
          },
          defaults: {
            iamUserAccessToBilling: true,
            roleName: "OrganizationAccountAccessRole",
          },
        },
        configSets: [],
        vars: {},
        serviceControlPolicies: {
          enabled: false,
          policies: [],
          policyType: "SERVICE_CONTROL_POLICY",
        },
        tagPolicies: {
          enabled: false,
          policies: [],
          policyType: "TAG_POLICY",
        },
        aiServicesOptOutPolicies: {
          enabled: false,
          policies: [],
          policyType: "AISERVICES_OPT_OUT_POLICY",
        },
        organizationalUnits: {
          Root: {
            accountAdminRoleName: null,
            accountBootstrapRoleName: null,
            bootstrapConfigSets: [],
            children: [],
            configSets: [],
            description: null,
            name: "Root",
            path: "Root",
            priority: 0,
            serviceControlPolicies: [],
            status: "active",
            tagPolicies: [],
            aiServicesOptOutPolicies: [],
            vars: {},
            accounts: [account({ id: "123456789012" })],
          },
        },
        trustedAwsServices: null,
        organizationAdminRoleName: null,
        accountAdminRoleName: null,
        accountBootstrapRoleName: null,
      })
    })
  })

  describe("when parsing a complex organization config", () => {
    test("returns correct configuration", async () => {
      const o = await parse("./test/config/complex-org-config.yml")

      expect(o).toStrictEqual({
        masterAccountId: "888888888888",
        accountCreation: {
          constraints: {
            emailPattern: null,
            namePattern: null,
          },
          defaults: {
            iamUserAccessToBilling: true,
            roleName: "OrganizationAccountAccessRole",
          },
        },
        configSets: [],
        vars: {},
        serviceControlPolicies: {
          enabled: true,
          policies: [
            {
              name: "FullAWSAccess",
              description: "AWS managed default policy",
              awsManaged: true,
            },
            {
              name: "AllowedRegions",
              description: "Set allowed regions",
              awsManaged: false,
            },
          ],
          policyType: "SERVICE_CONTROL_POLICY",
        },
        tagPolicies: {
          enabled: false,
          policies: [],
          policyType: "TAG_POLICY",
        },
        aiServicesOptOutPolicies: {
          enabled: false,
          policies: [],
          policyType: "AISERVICES_OPT_OUT_POLICY",
        },
        organizationalUnits: {
          Root: {
            accountAdminRoleName: null,
            accountBootstrapRoleName: null,
            bootstrapConfigSets: [],
            children: [
              {
                accountAdminRoleName: null,
                accountBootstrapRoleName: null,
                bootstrapConfigSets: [],
                configSets: [],
                description: null,
                name: "WebProject",
                path: "Root/WebProject",
                priority: 0,
                serviceControlPolicies: ["FullAWSAccess", "AllowedRegions"],
                aiServicesOptOutPolicies: [],
                status: "active",
                tagPolicies: [],
                vars: {},
                accounts: [],
                children: [
                  {
                    accountAdminRoleName: null,
                    accountBootstrapRoleName: null,
                    bootstrapConfigSets: [],
                    children: [],
                    configSets: [],
                    description: null,
                    name: "Development",
                    path: "Root/WebProject/Development",
                    priority: 0,
                    serviceControlPolicies: ["FullAWSAccess", "AllowedRegions"],
                    status: "active",
                    tagPolicies: [],
                    aiServicesOptOutPolicies: [],
                    vars: {},
                    accounts: [
                      account({
                        id: "333333333333",
                        serviceControlPolicies: [
                          "FullAWSAccess",
                          "AllowedRegions",
                        ],
                      }),
                    ],
                  },
                ],
              },
            ],
            configSets: [],
            description: null,
            name: "Root",
            path: "Root",
            priority: 0,
            serviceControlPolicies: ["FullAWSAccess"],
            aiServicesOptOutPolicies: [],
            status: "active",
            tagPolicies: [],
            vars: {},
            accounts: [
              account({
                id: "888888888888",
                serviceControlPolicies: ["FullAWSAccess"],
              }),
              account({
                id: "111111111111",
                serviceControlPolicies: ["FullAWSAccess"],
              }),
              account({
                id: "222222222222",
                serviceControlPolicies: ["FullAWSAccess"],
              }),
            ],
          },
        },
        trustedAwsServices: [
          "cloudtrail.amazonaws.com",
          "config.amazonaws.com",
          "ram.amazonaws.com",
          "sso.amazonaws.com",
        ],
        organizationAdminRoleName: null,
        accountAdminRoleName: null,
        accountBootstrapRoleName: null,
      })
    })
  })

  describe("when parsing a organization config with nested organizational units", () => {
    test("returns correct configuration", async () => {
      const o = await parse("./test/config/org-config-01.yml")

      expect(o).toStrictEqual({
        masterAccountId: "123456789012",
        accountCreation: {
          constraints: {
            emailPattern: null,
            namePattern: null,
          },
          defaults: {
            iamUserAccessToBilling: true,
            roleName: "OrganizationAccountAccessRole",
          },
        },
        configSets: [],
        vars: {},
        serviceControlPolicies: {
          enabled: false,
          policies: [],
          policyType: "SERVICE_CONTROL_POLICY",
        },
        tagPolicies: {
          enabled: false,
          policies: [],
          policyType: "TAG_POLICY",
        },
        aiServicesOptOutPolicies: {
          enabled: false,
          policies: [],
          policyType: "AISERVICES_OPT_OUT_POLICY",
        },
        organizationalUnits: {
          Root: {
            accountAdminRoleName: null,
            accountBootstrapRoleName: null,
            bootstrapConfigSets: [],
            children: [
              {
                accountAdminRoleName: null,
                accountBootstrapRoleName: null,
                bootstrapConfigSets: [],
                children: [],
                configSets: [],
                description: null,
                name: "Example",
                path: "Root/Example",
                priority: 0,
                serviceControlPolicies: [],
                aiServicesOptOutPolicies: [],
                status: "active",
                tagPolicies: [],
                vars: {},
                accounts: [
                  account({ id: "123456789012" }),
                  account({ id: "987654532101" }),
                ],
              },
              {
                accountAdminRoleName: null,
                accountBootstrapRoleName: null,
                bootstrapConfigSets: [],
                children: [],
                configSets: [],
                description: null,
                name: "Another",
                path: "Root/Another",
                priority: 0,
                serviceControlPolicies: [],
                aiServicesOptOutPolicies: [],
                status: "active",
                tagPolicies: [],
                vars: {},
                accounts: [],
              },
            ],
            configSets: [],
            description: null,
            name: "Root",
            path: "Root",
            priority: 0,
            serviceControlPolicies: [],
            aiServicesOptOutPolicies: [],
            status: "active",
            tagPolicies: [],
            vars: {},
            accounts: [],
          },
        },
        trustedAwsServices: null,
        organizationAdminRoleName: null,
        accountAdminRoleName: null,
        accountBootstrapRoleName: null,
      })
    })
  })
})
