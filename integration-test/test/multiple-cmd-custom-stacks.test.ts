/**
 * @testenv-recycler-count 2
 */
import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/multiple-cmd-custom-stacks`

describe("Multiple custom stacks", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "aCurrentState=pending",
        "aCommandState=created",
        "bCurrentState=pending",
        "bCommandState=created",
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
        "bCurrentState=created",
        "bCommandState=created",
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
