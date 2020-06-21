import { initOptionsAndVariables } from "@takomo/cli"
import {
  CliDeployAccountsIO,
  CliDeployOrganizationIO,
  CliDeployStacksIO,
  CliUndeployAccountsIO,
  CliUndeployStacksIO,
} from "@takomo/cli-io"
import { ConfigSetType } from "@takomo/config-sets"
import { CommandStatus, DeploymentOperation, Options } from "@takomo/core"
import {
  accountsOperationCommand,
  deployOrganizationCommand,
  DeployOrganizationOutput,
} from "@takomo/organization"
import {
  ORG_A_ACCOUNT_1_ID,
  ORG_A_ACCOUNT_2_ID,
  ORG_A_ACCOUNT_3_ID,
  ORG_A_ACCOUNT_4_ID,
  ORG_A_ACCOUNT_5_ID,
} from "./env"
import { TIMEOUT } from "./test-constants"

const createOptions = async (version: string) =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs",
    var: `configVersion=${version}.yml`,
  })

const launchOrganization = async (
  version: string,
): Promise<DeployOrganizationOutput> =>
  createOptions(version).then(({ options, variables, watch }) =>
    deployOrganizationCommand(
      {
        watch,
        variables,
        options,
      },
      new CliDeployOrganizationIO(options),
    ),
  )

describe("Organization commands", () => {
  it(
    "initial configuration",
    async () => {
      const { success, status, message } = await launchOrganization("v01")

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")
    },
    TIMEOUT,
  )

  it(
    "add new service control policy",
    async () => {
      const { success, status, message } = await launchOrganization("v02")

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")
    },
    TIMEOUT,
  )

  it(
    "add new organization units and move some accounts to them",
    async () => {
      const { success, status, message } = await launchOrganization("v03")

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")
    },
    TIMEOUT,
  )

  it(
    "add new tag policy",
    async () => {
      const { success, status, message } = await launchOrganization("v04")

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")
    },
    TIMEOUT,
  )

  it(
    "disable service control policies",
    async () => {
      const { success, status, message } = await launchOrganization("v05")

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")
    },
    TIMEOUT,
  )

  it(
    "disable tag policies",
    async () => {
      const { success, status, message } = await launchOrganization("v06")

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")
    },
    TIMEOUT,
  )

  it(
    "enabled tag policies",
    async () => {
      const { success, status, message } = await launchOrganization("v07")

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")
    },
    TIMEOUT,
  )

  // Undeploy all accounts
  it(
    "undeploy accounts",
    async () => {
      const { options, watch, variables } = await createOptions("v07")
      const {
        success,
        status,
        message,
        results,
      } = await accountsOperationCommand(
        {
          variables,
          watch,
          options,
          accountIds: [],
          organizationalUnits: [],
          operation: DeploymentOperation.UNDEPLOY,
          configSetType: ConfigSetType.STANDARD,
        },
        new CliUndeployAccountsIO(
          options,
          (options: Options, accountId: string) =>
            new CliDeployStacksIO(options, accountId),
          (options: Options, accountId: string) =>
            new CliUndeployStacksIO(options, accountId),
        ),
      )

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")

      expect(results).toHaveLength(2)

      const [sandbox2Ou, testAccountsOu] = results

      expect(sandbox2Ou.path).toBe("Root/sandbox accounts/sandbox-2")
      expect(sandbox2Ou.success).toBeTruthy()
      expect(sandbox2Ou.status).toBe(CommandStatus.SUCCESS)
      expect(sandbox2Ou.results).toHaveLength(2)

      const [a4, a5] = sandbox2Ou.results

      expect(a4.accountId).toBe(ORG_A_ACCOUNT_4_ID)
      expect(a4.success).toBeTruthy()

      expect(a5.accountId).toBe(ORG_A_ACCOUNT_5_ID)
      expect(a5.success).toBeTruthy()

      expect(testAccountsOu.path).toBe("Root/test-accounts")
      expect(testAccountsOu.success).toBeTruthy()
      expect(testAccountsOu.status).toBe(CommandStatus.SUCCESS)
      expect(testAccountsOu.results).toHaveLength(3)

      const [a1, a2, a3] = testAccountsOu.results

      expect(a1.accountId).toBe(ORG_A_ACCOUNT_1_ID)
      expect(a1.success).toBeTruthy()

      expect(a2.accountId).toBe(ORG_A_ACCOUNT_2_ID)
      expect(a2.success).toBeTruthy()

      expect(a3.accountId).toBe(ORG_A_ACCOUNT_3_ID)
      expect(a3.success).toBeTruthy()
    },
    TIMEOUT,
  )

  it(
    "deploy accounts from Root/test-accounts",
    async () => {
      const { options, watch, variables } = await createOptions("v07")
      const {
        success,
        status,
        message,
        results,
      } = await accountsOperationCommand(
        {
          variables,
          watch,
          options,
          accountIds: [],
          organizationalUnits: ["Root/test-accounts"],
          operation: DeploymentOperation.DEPLOY,
          configSetType: ConfigSetType.STANDARD,
        },
        new CliDeployAccountsIO(
          options,
          (options: Options, accountId: string) =>
            new CliDeployStacksIO(options, accountId),
          (options: Options, accountId: string) =>
            new CliUndeployStacksIO(options, accountId),
        ),
      )

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")
      expect(results).toHaveLength(1)

      const [testAccountsOu] = results

      expect(testAccountsOu.results).toHaveLength(3)
      const [a1, a2, a3] = testAccountsOu.results

      expect(a1.accountId).toBe(ORG_A_ACCOUNT_1_ID)
      expect(a1.success).toBeTruthy()

      expect(a2.accountId).toBe(ORG_A_ACCOUNT_2_ID)
      expect(a2.success).toBeTruthy()

      expect(a3.accountId).toBe(ORG_A_ACCOUNT_3_ID)
      expect(a3.success).toBeTruthy()
    },
    TIMEOUT,
  )

  it(
    "deploy single accounts",
    async () => {
      const { options, watch, variables } = await createOptions("v07")
      const {
        success,
        status,
        message,
        results,
      } = await accountsOperationCommand(
        {
          variables,
          watch,
          options,
          accountIds: [ORG_A_ACCOUNT_4_ID, ORG_A_ACCOUNT_5_ID],
          organizationalUnits: [],
          operation: DeploymentOperation.DEPLOY,
          configSetType: ConfigSetType.STANDARD,
        },
        new CliDeployAccountsIO(
          options,
          (options: Options, accountId: string) =>
            new CliDeployStacksIO(options, accountId),
          (options: Options, accountId: string) =>
            new CliUndeployStacksIO(options, accountId),
        ),
      )

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")

      expect(results).toHaveLength(1)

      const [sandbox2Ou] = results
      expect(sandbox2Ou.results).toHaveLength(2)

      const [a4, a5] = sandbox2Ou.results

      expect(a4.accountId).toBe(ORG_A_ACCOUNT_4_ID)
      expect(a4.success).toBeTruthy()

      expect(a5.accountId).toBe(ORG_A_ACCOUNT_5_ID)
      expect(a5.success).toBeTruthy()
    },
    TIMEOUT,
  )

  it(
    "bootstrap accounts",
    async () => {
      const { options, watch, variables } = await createOptions("v07")
      const {
        success,
        status,
        message,
        results,
      } = await accountsOperationCommand(
        {
          variables,
          watch,
          options,
          accountIds: [],
          organizationalUnits: [],
          operation: DeploymentOperation.DEPLOY,
          configSetType: ConfigSetType.BOOTSTRAP,
        },
        new CliDeployAccountsIO(
          options,
          (options: Options, accountId: string) =>
            new CliDeployStacksIO(options, accountId),
          (options: Options, accountId: string) =>
            new CliUndeployStacksIO(options, accountId),
        ),
      )

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")

      expect(results).toHaveLength(1)

      const [testOu] = results
      expect(testOu.results).toHaveLength(3)

      const [a1, a2, a3] = testOu.results

      expect(a1.accountId).toBe(ORG_A_ACCOUNT_1_ID)
      expect(a1.success).toBeTruthy()

      expect(a2.accountId).toBe(ORG_A_ACCOUNT_2_ID)
      expect(a2.success).toBeTruthy()

      expect(a3.accountId).toBe(ORG_A_ACCOUNT_3_ID)
      expect(a3.success).toBeTruthy()
    },
    TIMEOUT,
  )

  it(
    "deploy organizational units that use config set with different project dir",
    async () => {
      const { options, watch, variables } = await createOptions("v08")
      const {
        success,
        status,
        message,
        results,
      } = await accountsOperationCommand(
        {
          variables,
          watch,
          options,
          accountIds: [],
          organizationalUnits: ["Root/sandbox accounts/sandbox-2"],
          operation: DeploymentOperation.DEPLOY,
          configSetType: ConfigSetType.STANDARD,
        },
        new CliDeployAccountsIO(
          options,
          (options: Options, accountId: string) =>
            new CliDeployStacksIO(options, accountId),
          (options: Options, accountId: string) =>
            new CliUndeployStacksIO(options, accountId),
        ),
      )

      expect(success).toBeTruthy()
      expect(status).toBe(CommandStatus.SUCCESS)
      expect(message).toBe("Success")

      expect(results).toHaveLength(1)

      const [sandbox2Ou] = results
      expect(sandbox2Ou.results).toHaveLength(2)

      const [a4, a5] = sandbox2Ou.results

      expect(a4.accountId).toBe(ORG_A_ACCOUNT_4_ID)
      expect(a4.success).toBeTruthy()

      expect(a5.accountId).toBe(ORG_A_ACCOUNT_5_ID)
      expect(a5.success).toBeTruthy()
    },
    TIMEOUT,
  )
})
