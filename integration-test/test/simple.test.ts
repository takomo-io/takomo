import { isNumber } from "../src/assertions.js"
import { executeWithCli } from "../src/cli/execute.js"
import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks.js"

const stackPath = "/vpc.yml/eu-central-1",
  stackName = "simple-vpc",
  projectDir = `${process.cwd()}/integration-test/configs/simple`

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
      `node bin/tkm.mjs stacks deploy --quiet --output json -y -d ${projectDir}`,
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
            type: "standard",
          },
        ],
      })
      .assert())

  test("Undeploy with cli", () =>
    executeWithCli(
      `node bin/tkm.mjs stacks undeploy --quiet --output json -y -d ${projectDir}`,
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
            type: "standard",
          },
        ],
      })
      .assert())
})
