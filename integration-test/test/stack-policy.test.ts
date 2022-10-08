import { ALLOW_ALL_STACK_POLICY } from "../../src/takomo-aws-model"
import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks"
import { withSingleAccountReservation } from "../src/reservations"

const stackPath = "/my-stack.yml/eu-central-1",
  stackName = "my-stack",
  projectDir = `${process.cwd()}/integration-test/configs/stack-policy`

describe("Stack policy", () => {
  test(
    "Create stack with stack policy",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["case1=true", "retentionDays=3"],
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess({
          stackPath,
          stackName,
        })
        .expectDeployedCfStack({
          stackName,
          accountId,
          credentials,
          region: "eu-central-1",
          roleName: "OrganizationAccountAccessRole",
          expectedStackPolicy:
            '{"Statement": [{"Effect": "Allow","NotAction" : "Update:Delete","Principal": "*","Resource" : "*" }]}',
        })
        .assert(),
    ),
  )

  test(
    "Update the stack policy",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["case2=true", "retentionDays=3"],
      })
        .expectCommandToSucceed()
        .expectStackUpdateSuccess({
          stackPath,
          stackName,
        })
        .expectDeployedCfStack({
          stackName,
          accountId,
          credentials,
          region: "eu-central-1",
          roleName: "OrganizationAccountAccessRole",
          expectedStackPolicy:
            '{"Statement":[{"Effect":"Deny","Action":"Update:*","Principal":"*","Resource":"*"}]}',
        })
        .assert(),
    ),
  )

  test("Update fails because stack policy deny", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["case2=true", "retentionDays=1"],
    })
      .expectCommandToFail("Failed")
      .expectStackUpdateFail({
        stackPath,
        stackName,
      })
      .assert())

  test(
    "Update succeeds with stack policy during update",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["case2=true", "retentionDays=1", "case3=true"],
      })
        .expectCommandToSucceed()
        .expectStackUpdateSuccess({
          stackPath,
          stackName,
        })
        .expectDeployedCfStack({
          stackName,
          accountId,
          credentials,
          region: "eu-central-1",
          roleName: "OrganizationAccountAccessRole",
          expectedStackPolicy:
            '{"Statement":[{"Effect":"Deny","Action":"Update:*","Principal":"*","Resource":"*"}]}',
        })
        .assert(),
    ),
  )

  test(
    "Removing the stack policy",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["retentionDays=1"],
      })
        .expectCommandToSucceed()
        .expectStackUpdateSuccess({
          stackPath,
          stackName,
        })
        .expectDeployedCfStack({
          stackName,
          accountId,
          credentials,
          region: "eu-central-1",
          roleName: "OrganizationAccountAccessRole",
          expectedStackPolicy: ALLOW_ALL_STACK_POLICY,
        })
        .assert(),
    ),
  )

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["retentionDays=1"],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackPath,
        stackName,
      })
      .assert())
})
