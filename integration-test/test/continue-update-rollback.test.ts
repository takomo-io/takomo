import { uuid } from "../../src/utils/strings"
import { aws } from "../src/aws-api"
import { executeDeployStacksCommand } from "../src/commands/stacks"
import { withSingleAccountReservation } from "../src/reservations"

const projectDir = `${process.cwd()}/integration-test/configs/continue-update-rollback`
const stack = {
  stackName: "hello",
  stackPath: "/hello.yml/eu-north-1",
}

const roleName = "R" + uuid().replace(/-/g, "")

describe("Continue update rollback", () => {
  test(
    "Create should succeed",
    withSingleAccountReservation(async ({ accountId, credentials }) => {
      const identity = await aws.sts.getCallerIdentity(credentials)
      return executeDeployStacksCommand({
        projectDir,
        var: [
          "template=one.yml",
          `executorAccountId=${identity.accountId}`,
          `roleName=${roleName}`,
          `commandRole=arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`,
        ],
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess(stack)
        .assert()
    }),
  )

  test(
    "Update should fail and lead to rollback failure",
    withSingleAccountReservation(async ({ accountId, credentials }) => {
      const identity = await aws.sts.getCallerIdentity(credentials)
      return executeDeployStacksCommand({
        projectDir,
        var: [
          "template=two.yml",
          `executorAccountId=${identity.accountId}`,
          `roleName=${roleName}`,
          `commandRole=arn:aws:iam::${accountId}:role/${roleName}`,
        ],
      })
        .expectCommandToFail("Failed")
        .expectStackUpdateFail(stack)
        .assert()
    }),
  )

  test(
    "Updating again should continue the failed rollback and complete deployment",
    withSingleAccountReservation(async ({ accountId, credentials }) => {
      const identity = await aws.sts.getCallerIdentity(credentials)

      return executeDeployStacksCommand({
        projectDir,
        var: [
          "template=three.yml",
          `executorAccountId=${identity.accountId}`,
          `roleName=${roleName}`,
          `commandRole=arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`,
        ],
      })
        .expectCommandToSucceed()
        .expectStackUpdateSuccess(stack)
        .assert()
    }),
  )
})
