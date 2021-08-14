import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/hooks",
  commandPath = "/delete/after/skip"

describe("After hook that skip", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir, commandPath })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/delete/after/skip/stack-1.yml/eu-west-1",
        stackName: "examples-hooks-delete-after-skip-stack-1",
      })
      .expectStackCreateSuccess({
        stackPath: "/delete/after/skip/stack-2.yml/eu-west-1",
        stackName: "examples-hooks-delete-after-skip-stack-2",
      })
      .expectStackCreateSuccess({
        stackPath: "/delete/after/skip/stack-3.yml/eu-west-1",
        stackName: "examples-hooks-delete-after-skip-stack-3",
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      commandPath,
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackPath: "/delete/after/skip/stack-3.yml/eu-west-1",
        stackName: "examples-hooks-delete-after-skip-stack-3",
      })
      .expectStackDeleteSuccess({
        stackPath: "/delete/after/skip/stack-2.yml/eu-west-1",
        stackName: "examples-hooks-delete-after-skip-stack-2",
      })
      .expectStackDeleteSuccess({
        stackPath: "/delete/after/skip/stack-1.yml/eu-west-1",
        stackName: "examples-hooks-delete-after-skip-stack-1",
      })
      .assert())
})
