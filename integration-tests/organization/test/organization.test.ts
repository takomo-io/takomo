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
} from "@takomo/organization-commands"
import {
  ORG_A_ACCOUNT_1_ID,
  ORG_A_ACCOUNT_2_ID,
  ORG_A_ACCOUNT_3_ID,
  ORG_A_ACCOUNT_4_ID,
  ORG_A_ACCOUNT_5_ID,
} from "./env"

const createOptions = async (version: string) =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs",
    var: `configVersion=${version}.yml`,
  })

const deployOrganization = async (
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
  test("initial configuration", async () => {
    const { success, status, message } = await deployOrganization("v01")

    expect(success).toBeTruthy()
    expect(status).toBe(CommandStatus.SUCCESS)
    expect(message).toBe("Success")
  })

  test("add new service control policy", async () => {
    const { success, status, message } = await deployOrganization("v02")

    expect(success).toBeTruthy()
    expect(status).toBe(CommandStatus.SUCCESS)
    expect(message).toBe("Success")
  })

  test("add new organization units and move some accounts to them", async () => {
    const { success, status, message } = await deployOrganization("v03")

    expect(success).toBeTruthy()
    expect(status).toBe(CommandStatus.SUCCESS)
    expect(message).toBe("Success")
  })

  test("add new tag policy", async () => {
    const { success, status, message } = await deployOrganization("v04")

    expect(success).toBeTruthy()
    expect(status).toBe(CommandStatus.SUCCESS)
    expect(message).toBe("Success")
  })

  test("disable service control policies", async () => {
    const { success, status, message } = await deployOrganization("v05")

    expect(success).toBeTruthy()
    expect(status).toBe(CommandStatus.SUCCESS)
    expect(message).toBe("Success")
  })

  test("disable tag policies", async () => {
    const { success, status, message } = await deployOrganization("v06")

    expect(success).toBeTruthy()
    expect(status).toBe(CommandStatus.SUCCESS)
    expect(message).toBe("Success")
  })

  test("enabled tag policies", async () => {
    const { success, status, message } = await deployOrganization("v07")

    expect(success).toBeTruthy()
    expect(status).toBe(CommandStatus.SUCCESS)
    expect(message).toBe("Success")
  })

  // Undeploy all accounts
  test("undeploy accounts", async () => {
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
          new CliDeployStacksIO(options, console.log, accountId),
        (options: Options, accountId: string) =>
          new CliUndeployStacksIO(options, console.log, accountId),
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
  })

  test("deploy accounts from Root/test-accounts", async () => {
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
          new CliDeployStacksIO(options, console.log, accountId),
        (options: Options, accountId: string) =>
          new CliUndeployStacksIO(options, console.log, accountId),
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
  })

  test("deploy single accounts", async () => {
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
          new CliDeployStacksIO(options, console.log, accountId),
        (options: Options, accountId: string) =>
          new CliUndeployStacksIO(options, console.log, accountId),
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
  })

  test("bootstrap accounts", async () => {
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
          new CliDeployStacksIO(options, console.log, accountId),
        (options: Options, accountId: string) =>
          new CliUndeployStacksIO(options, console.log, accountId),
      ),
    )

    expect(success).toBeTruthy()
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
  })

  test("deploy organizational units that use config set with different project dir", async () => {
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
          new CliDeployStacksIO(options, console.log, accountId),
        (options: Options, accountId: string) =>
          new CliUndeployStacksIO(options, console.log, accountId),
      ),
    )

    expect(success).toBeTruthy()
    expect(results).toHaveLength(1)

    const [sandbox2Ou] = results
    expect(sandbox2Ou.results).toHaveLength(2)

    const [a4, a5] = sandbox2Ou.results

    expect(a4.accountId).toBe(ORG_A_ACCOUNT_4_ID)
    expect(a4.success).toBeTruthy()

    expect(a5.accountId).toBe(ORG_A_ACCOUNT_5_ID)
    expect(a5.success).toBeTruthy()
  })

  test("enable AI services opt-out policies", async () => {
    const { success, status, message } = await deployOrganization("v09")

    expect(success).toBeTruthy()
    expect(status).toBe(CommandStatus.SUCCESS)
    expect(message).toBe("Success")
  })

  test("enable backup policies", async () => {
    const { success, status, message } = await deployOrganization("v10")

    expect(success).toBeTruthy()
    expect(status).toBe(CommandStatus.SUCCESS)
    expect(message).toBe("Success")
  })
})
