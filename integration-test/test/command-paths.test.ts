/**
 * Test that only configuration files for stack groups and stacks within
 * the given command path are loaded. It should not be required to provide
 * values for variables in config files outside the command path.
 */

import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/command-paths`

describe("Command paths", () => {
  test("Deploying '/dev/app/logs.yml' does not require providing values for variables outside the stack", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/dev/app/logs.yml",
      var: ["devLogGroupName=myLogGroup"],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "dev-app-logs",
        stackPath: "/dev/app/logs.yml/eu-north-1",
      })
      .assert())

  test("Deploying '/dev/app/sg.yml' causes stack '/dev/vpc.yml' to be deployed as well", () =>
    executeDeployStacksCommand({ projectDir, commandPath: "/dev/app/sg.yml" })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "dev-vpc",
        stackPath: "/dev/vpc.yml/eu-north-1",
      })
      .expectStackCreateSuccess({
        stackName: "dev-app-sg",
        stackPath: "/dev/app/sg.yml/eu-north-1",
      })
      .assert())
})
