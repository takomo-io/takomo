/**
 * Tests creating, updating and deleting of SAM stacks, with and without
 * reviewing of changes (the --yes cli option).
 *
 * SAM related documentation: https://docs.aws.amazon.com/serverless-application-model/index.html
 */

import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
  StacksOperationOutputMatcher,
} from "@takomo/test-integration"

const deploy = (
  timeout: number,
  autoConfirmEnabled: boolean,
): StacksOperationOutputMatcher =>
  executeDeployStacksCommand({
    autoConfirmEnabled,
    projectDir: "configs/sam",
    var: [`timeout=${timeout}`],
    answers: {
      confirmStackDeploy: "CONTINUE",
      confirmDeploy: "CONTINUE_AND_REVIEW",
    },
  })

const undeploy = (autoConfirmEnabled: boolean): StacksOperationOutputMatcher =>
  executeUndeployStacksCommand({
    autoConfirmEnabled,
    projectDir: "configs/sam",
    var: [`timeout=1`],
    answers: { confirmUndeploy: "CONTINUE" },
  })

const stackName = "sam"
const stackPath = "/sam.yml/eu-north-1"

describe("SAM", () => {
  test("Deploy", () =>
    deploy(1, true)
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .assert())

  test("Deploy with no changes", () =>
    deploy(1, true)
      .expectCommandToSucceed()
      .expectStackUpdateSuccess({
        stackPath,
        stackName,
      })
      .assert())

  test("Deploy with changes", () =>
    deploy(2, true)
      .expectCommandToSucceed()
      .expectStackUpdateSuccess({
        stackName,
        stackPath,
      })
      .assert())

  test("Undeploy", () =>
    undeploy(true)
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackName,
        stackPath,
      })
      .assert())

  test("Deploy with review", () =>
    deploy(1, false)
      .expectCommandToSucceed()
      .expectStackCreateSuccess({ stackPath, stackName })
      .assert())

  test("Deploy with review and no changes", () =>
    deploy(1, false)
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges({ stackName, stackPath })
      .assert())

  test("Deploy with review and changes", () =>
    deploy(2, false)
      .expectCommandToSucceed()
      .expectStackUpdateSuccess({ stackPath, stackName })
      .assert())

  test("Undeploy with review", () =>
    undeploy(false)
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({ stackName, stackPath })
      .assert())
})
