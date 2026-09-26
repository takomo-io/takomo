import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks.js"
import { withSingleAccountReservation } from "../src/reservations.js"

const projectDir = `${process.cwd()}/integration-test/configs/deployment-config`,
  region = "eu-north-1",
  roleName = "OrganizationAccountAccessRole"

const expressStack = {
  stackName: "express",
  stackPath: "/express.yml/eu-north-1",
}

const standardStack = {
  stackName: "standard",
  stackPath: "/standard.yml/eu-north-1",
}

describe("Deployment config", () => {
  test(
    "Create stacks",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["displayName=one"],
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess(expressStack, standardStack)
        .expectDeployedCfStack({
          ...expressStack,
          accountId,
          credentials,
          region,
          roleName,
          expected: {
            StackStatus: "CREATE_COMPLETE",
            DeploymentConfig: expect.objectContaining({ Mode: "EXPRESS" }),
          },
        })
        .expectDeployedCfStack({
          ...standardStack,
          accountId,
          credentials,
          region,
          roleName,
          expected: {
            StackStatus: "CREATE_COMPLETE",
            DeploymentConfig: expect.objectContaining({ Mode: "STANDARD" }),
          },
        })
        .assert(),
    ),
  )

  test(
    "Update stacks",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["displayName=two"],
      })
        .expectCommandToSucceed()
        .expectStackUpdateSuccess(expressStack, standardStack)
        .expectDeployedCfStack({
          ...expressStack,
          accountId,
          credentials,
          region,
          roleName,
          expected: {
            StackStatus: "UPDATE_COMPLETE",
            DeploymentConfig: expect.objectContaining({ Mode: "EXPRESS" }),
          },
        })
        .expectDeployedCfStack({
          ...standardStack,
          accountId,
          credentials,
          region,
          roleName,
          expected: {
            StackStatus: "UPDATE_COMPLETE",
            DeploymentConfig: expect.objectContaining({ Mode: "STANDARD" }),
          },
        })
        .assert(),
    ),
  )

  test("Update with no changes", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["displayName=two"],
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges(expressStack, standardStack)
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["displayName=two"],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(expressStack, standardStack)
      .assert())
})
