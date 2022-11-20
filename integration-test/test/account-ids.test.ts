import { TakomoError } from "../../src/utils/errors"
import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks"
import { withSingleAccountReservation } from "../src/reservations"

const projectDir = `${process.cwd()}/integration-test/configs/account-ids`

describe("Account ids", () => {
  test(
    "Deploy should fail when credentials do not belong to the account given in accountIds",
    withSingleAccountReservation(({ accountId }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["OTHER_ACCOUNT_ID=123456789012"],
      }).expectCommandToThrow(
        new TakomoError(
          `Credentials associated with the stack /vpc/two.yml/eu-west-1 point to an AWS account with id ${accountId} which is not allowed in stack configuration.\n\n` +
            "List of allowed account ids:\n\n" +
            "- 123456789012",
        ),
      ),
    ),
  )

  test(
    "Successful deploy",
    withSingleAccountReservation(({ accountId }) =>
      executeDeployStacksCommand({
        projectDir,
        var: [`OTHER_ACCOUNT_ID=${accountId}`],
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess(
          {
            stackName: "vpc-one",
            stackPath: "/vpc/one.yml/eu-west-1",
          },
          {
            stackName: "vpc-two",
            stackPath: "/vpc/two.yml/eu-west-1",
          },
        )
        .assert(),
    ),
  )

  test(
    "Deploy again should fail when credentials do not belong to the account given in accountIds",
    withSingleAccountReservation(({ accountId }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["OTHER_ACCOUNT_ID=666666666666"],
      }).expectCommandToThrow(
        new TakomoError(
          `Credentials associated with the stack /vpc/two.yml/eu-west-1 point to an AWS account with id ${accountId} which is not allowed in stack configuration.\n\n` +
            "List of allowed account ids:\n\n" +
            "- 666666666666",
        ),
      ),
    ),
  )

  test("Deploy should succeed when only '/vpc/one.yml/eu-west-1' is deployed", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["OTHER_ACCOUNT_ID=666666666666"],
      commandPath: "/vpc/one.yml/eu-west-1",
    })
      .expectCommandToSucceed()
      .expectSuccessStackResult({
        message: "No changes",
        stackName: "vpc-one",
        stackPath: "/vpc/one.yml/eu-west-1",
      })
      .assert())

  test(
    "Undeploy should fail when credentials do not belong to the account given in accountIds",
    withSingleAccountReservation(({ accountId }) =>
      executeUndeployStacksCommand({
        projectDir,
        var: ["OTHER_ACCOUNT_ID=123412341234"],
      }).expectCommandToThrow(
        new TakomoError(
          `Credentials associated with the stack /vpc/two.yml/eu-west-1 point to an AWS account with id ${accountId} which is not allowed in stack configuration.\n\n` +
            "List of allowed account ids:\n\n" +
            "- 123412341234",
        ),
      ),
    ),
  )

  test("Undeploy should succeed when only '/vpc/one.yml/eu-west-1' is undeployed", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["OTHER_ACCOUNT_ID=666666666666"],
      commandPath: "/vpc/one.yml/eu-west-1",
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackName: "vpc-one",
        stackPath: "/vpc/one.yml/eu-west-1",
      })
      .assert())

  test(
    "Successful undeploy",
    withSingleAccountReservation(({ accountId }) =>
      executeUndeployStacksCommand({
        projectDir,
        var: [`OTHER_ACCOUNT_ID=${accountId}`],
      })
        .expectCommandToSucceed()
        .expectStackDeleteSuccess({
          stackName: "vpc-two",
          stackPath: "/vpc/two.yml/eu-west-1",
        })
        .expectSkippedStackResult({
          message: "Stack not found",
          stackName: "vpc-one",
          stackPath: "/vpc/one.yml/eu-west-1",
        })
        .assert(),
    ),
  )
})
