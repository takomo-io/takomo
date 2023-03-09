import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/resolvers/stack-output-with-confidential`

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
