import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"
import { TakomoError } from "@takomo/util/src"

const stackName = "termination-protection"
const stackPath = "/a.yml/eu-north-1"
const projectDir = "configs/termination-protection"

describe("Termination protection", () => {
  test("Create a stack with termination protection enabled", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["terminationProtection=true"],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
        expectDeployedStack: {
          terminationProtection: true,
        },
      })
      .assert())

  test("Try to undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["terminationProtection=false"],
    }).expectCommandToThrow(
      new TakomoError(
        "Can't undeploy stacks because following stacks have termination protection enabled:\n\n" +
          "  - /a.yml/eu-north-1",
      ),
    ))

  test("Disable termination protection", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["terminationProtection=false"],
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccess({
        stackName,
        stackPath,
        expectDeployedStack: {
          terminationProtection: false,
        },
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["terminationProtection=false"],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackName,
        stackPath,
      })
      .assert())
})
