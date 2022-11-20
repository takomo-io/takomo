import { uuid } from "../../src/utils/strings"
import { aws } from "../src/aws-api"
import { executeDeployStacksCommand } from "../src/commands/stacks"
import { withSingleAccountReservation } from "../src/reservations"

const projectDir = `${process.cwd()}/integration-test/configs/stack-create-fails`
const roleStack = {
  stackName: "role",
  stackPath: "/role.yml/eu-north-1",
}

const stack = {
  stackName: "stack",
  stackPath: "/stack.yml/eu-north-1",
}

const roleName = "R" + uuid().replace(/-/g, "")

describe("Creating stack fails", () => {
  test(
    "Create role stack",
    withSingleAccountReservation(async ({ accountId, credentials }) => {
      const identity = await aws.sts.getCallerIdentity(credentials)
      return executeDeployStacksCommand({
        projectDir,
        commandPath: "/role.yml",
        var: [
          `executorAccountId=${identity.accountId}`,
          `roleName=${roleName}`,
          `commandRole=arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`,
        ],
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess(roleStack)
        .assert()
    }),
  )

  test(
    "Create stack fails",
    withSingleAccountReservation(({ accountId }) =>
      executeDeployStacksCommand({
        projectDir,
        commandPath: "/stack.yml",
        var: [`commandRole=arn:aws:iam::${accountId}:role/${roleName}`],
      })
        .expectCommandToFail("Failed")
        .expectStackCreateFail(stack)
        .assert(),
    ),
  )

  test(
    "Create stack succeeds with role that has enough permissions",
    withSingleAccountReservation(({ accountId }) =>
      executeDeployStacksCommand({
        projectDir,
        commandPath: "/stack.yml",
        var: [
          `commandRole=arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`,
        ],
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess(stack)
        .assert(),
    ),
  )
})
