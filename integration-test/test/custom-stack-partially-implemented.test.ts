import { TakomoError } from "../../src/utils/errors.js"
import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/custom-stack-partially-implemented`

const exampleStack = {
  stackPath: "/example.yml/eu-north-1",
  stackName: "example",
}

describe("Custom stack partially implemented", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(exampleStack)
      .assert())

  test("Deploy again will invoke create again and not update", () =>
    executeDeployStacksCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(exampleStack)
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(exampleStack)
      .assert())

  test("Undeploy again will invoke delete again and not skip", () =>
    executeUndeployStacksCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(exampleStack)
      .assert())
})
