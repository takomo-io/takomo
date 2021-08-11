/**
 * @testenv-recycler-count 3
 */
import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

describe("Multi-account", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir: "configs/multi-account" })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "account-1",
        stackPath: "/account-1.yml/eu-central-1",
      })
      .expectStackCreateSuccess({
        stackName: "account-1",
        stackPath: "/account-1.yml/eu-north-1",
      })
      .expectStackCreateSuccess({
        stackName: "account-2",
        stackPath: "/account-2.yml/eu-west-1",
      })
      .expectStackCreateSuccess({
        stackName: "account-3",
        stackPath: "/account-3.yml/eu-north-1",
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({ projectDir: "configs/multi-account" })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackName: "account-1",
        stackPath: "/account-1.yml/eu-central-1",
      })
      .expectStackDeleteSuccess({
        stackName: "account-1",
        stackPath: "/account-1.yml/eu-north-1",
      })
      .expectStackDeleteSuccess({
        stackName: "account-2",
        stackPath: "/account-2.yml/eu-west-1",
      })
      .expectStackDeleteSuccess({
        stackName: "account-3",
        stackPath: "/account-3.yml/eu-north-1",
      })
      .assert())
})
