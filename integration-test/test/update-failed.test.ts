import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks.js"
import { withSingleAccountReservation } from "../src/reservations.js"

const projectDir = `${process.cwd()}/integration-test/configs/update-failed`,
  region = "eu-north-1",
  roleName = "OrganizationAccountAccessRole"

const stack = {
  stackName: "update-failed",
  stackPath: "/update-failed.yml/eu-north-1",
}

describe("Update failed with rollback disabled", () => {
  test(
    "Create stack",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["create_wait_condition=false"],
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess(stack)
        .expectDeployedCfStack({
          ...stack,
          accountId,
          credentials,
          region,
          roleName,
          expected: {
            StackStatus: "CREATE_COMPLETE",
          },
        })
        .assert(),
    ),
  )

  test(
    "Failing update leaves stack in UPDATE_FAILED status",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["create_wait_condition=true"],
      })
        .expectCommandToFail("Failed")
        .expectStackUpdateFail(stack)
        .expectDeployedCfStack({
          ...stack,
          accountId,
          credentials,
          region,
          roleName,
          expected: {
            StackStatus: "UPDATE_FAILED",
          },
        })
        .assert(),
    ),
  )

  test(
    "Stack in UPDATE_FAILED status can be updated",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["create_wait_condition=false"],
      })
        .expectCommandToSucceed()
        .expectStackUpdateSuccess(stack)
        .expectDeployedCfStack({
          ...stack,
          accountId,
          credentials,
          region,
          roleName,
          expected: {
            StackStatus: "UPDATE_COMPLETE",
          },
        })
        .assert(),
    ),
  )

  test(
    "Failing update again",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["create_wait_condition=true"],
      })
        .expectCommandToFail("Failed")
        .expectStackUpdateFail(stack)
        .expectDeployedCfStack({
          ...stack,
          accountId,
          credentials,
          region,
          roleName,
          expected: {
            StackStatus: "UPDATE_FAILED",
          },
        })
        .assert(),
    ),
  )

  test("Stack in UPDATE_FAILED status can be undeployed", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["create_wait_condition=true"],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(stack)
      .assert())
})
