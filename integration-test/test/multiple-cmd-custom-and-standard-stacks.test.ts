import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/multiple-cmd-custom-and-standard-stacks`

describe("Multiple custom and standard stacks", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "aCurrentState=pending",
        "aCommandState=created",
        "cCurrentState=pending",
        "cCommandState=created",
      ],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(
        {
          stackPath: "/a.yml/eu-north-1",
          stackName: "a",
        },
        {
          stackPath: "/b.yml/eu-west-1",
          stackName: "b",
        },
        {
          stackPath: "/c.yml/eu-central-1",
          stackName: "c",
        },
      )
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: [
        "aCurrentState=created",
        "aCommandState=created",
        "cCurrentState=created",
        "cCommandState=created",
      ],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(
        {
          stackPath: "/a.yml/eu-north-1",
          stackName: "a",
        },
        {
          stackPath: "/b.yml/eu-west-1",
          stackName: "b",
        },
        {
          stackPath: "/c.yml/eu-central-1",
          stackName: "c",
        },
      )
      .assert())
})
