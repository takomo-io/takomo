import {
  executeDeployStacksCommand,
  executeListStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/resolvers/stack-output-with-confidential"

describe("Stack output resolvers with confidential enabled", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/security-groups.yml/eu-west-1",
        stackName: "security-groups",
      })
      .expectStackCreateSuccess({
        stackPath: "/vpc.yml/eu-west-1",
        stackName: "vpc",
      })
      .assert())

  test("List all stacks", () =>
    executeListStacksCommand({ projectDir })
      .expectOutputToBeSuccessful()
      .expectStack({
        stackPath: "/vpc.yml/eu-west-1",
        stackName: "vpc",
        status: "CREATE_COMPLETE",
      })
      .expectStack({
        stackPath: "/security-groups.yml/eu-west-1",
        stackName: "security-groups",
        status: "CREATE_COMPLETE",
      })
      .assert())

  test("List stacks by path", () =>
    executeListStacksCommand({
      projectDir,
      commandPath: "/security-groups.yml",
    })
      .expectOutputToBeSuccessful()
      .expectStack({
        stackPath: "/security-groups.yml/eu-west-1",
        stackName: "security-groups",
        status: "CREATE_COMPLETE",
      })
      .assert())

  test("Deploy with ignore dependencies", () =>
    executeDeployStacksCommand({
      projectDir,
      ignoreDependencies: true,
      commandPath: "/security-groups.yml",
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges({
        stackPath: "/security-groups.yml/eu-west-1",
        stackName: "security-groups",
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackPath: "/security-groups.yml/eu-west-1",
        stackName: "security-groups",
      })
      .expectStackDeleteSuccess({
        stackPath: "/vpc.yml/eu-west-1",
        stackName: "vpc",
      })
      .assert())
})
