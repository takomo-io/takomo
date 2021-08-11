import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
  executeWithCli,
} from "@takomo/test-integration"
import { isNumber } from "@takomo/test-unit"

const stackPath = "/vpc.yml/eu-central-1",
  stackName = "simple-vpc",
  projectDir = "configs/simple"

describe("Simple", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath,
        stackName,
      })
      .assert())

  test("Deploy without changes", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges({
        stackPath,
        stackName,
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackPath,
        stackName,
      })
      .assert())

  test("Deploy with cli", () =>
    executeWithCli(
      `./bin/tkm stacks deploy --quiet --output json -y -d ${projectDir}`,
    )
      .expectJson({
        status: "SUCCESS",
        success: true,
        message: "Success",
        time: isNumber,
        stacks: [
          {
            path: stackPath,
            name: stackName,
            time: isNumber,
            message: "Stack create succeeded",
            status: "SUCCESS",
          },
        ],
      })
      .assert())

  test("Undeploy with cli", () =>
    executeWithCli(
      `./bin/tkm stacks undeploy --quiet --output json -y -d ${projectDir}`,
    )
      .expectJson({
        status: "SUCCESS",
        success: true,
        message: "Success",
        time: isNumber,
        stacks: [
          {
            path: stackPath,
            name: stackName,
            time: isNumber,
            message: "Stack delete succeeded",
            status: "SUCCESS",
          },
        ],
      })
      .assert())
})
