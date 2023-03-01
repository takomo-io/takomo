/**
 * @testenv-recycler-count 2
 */
import {
  executeDeployStacksCommand,
  executeListStacksCommand,
} from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/list-stacks-multi-account`

const a1 = {
  stackName: "a-a1",
  stackPath: "/a/a1.yml/eu-west-1",
}
const a2 = {
  stackName: "a-a2",
  stackPath: "/a/a2.yml/eu-north-1",
}
const b1 = {
  stackName: "b-b1",
  stackPath: "/b/b1.yml/eu-west-1",
}
const b2 = {
  stackName: "b-b2",
  stackPath: "/b/b2.yml/eu-north-1",
}

describe("List stacks multi-account", () => {
  test("List all stacks before deploy", () =>
    executeListStacksCommand({ projectDir })
      .expectOutputToBeSuccessful()
      .expectStack({
        ...a1,
        status: undefined,
      })
      .expectStack({
        ...a2,
        status: undefined,
      })
      .expectStack({
        ...b1,
        status: undefined,
      })
      .expectStack({
        ...b2,
        status: undefined,
      })
      .assert())

  test("Deploy a2", () =>
    executeDeployStacksCommand({ projectDir, commandPath: "/a/a2.yml" })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(a2)
      .assert())

  test("List all stacks", () =>
    executeListStacksCommand({ projectDir })
      .expectOutputToBeSuccessful()
      .expectStack({
        ...a1,
        status: undefined,
      })
      .expectStack({
        ...a2,
        status: "CREATE_COMPLETE",
      })
      .expectStack({
        ...b1,
        status: undefined,
      })
      .expectStack({
        ...b2,
        status: undefined,
      })
      .assert())

  test("Deploy all", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges(a2)
      .expectStackCreateSuccess(a1, b1, b2)
      .assert())

  test("List all stacks", () =>
    executeListStacksCommand({ projectDir })
      .expectOutputToBeSuccessful()
      .expectStack({
        ...a1,
        status: "CREATE_COMPLETE",
      })
      .expectStack({
        ...a2,
        status: "CREATE_COMPLETE",
      })
      .expectStack({
        ...b1,
        status: "CREATE_COMPLETE",
      })
      .expectStack({
        ...b2,
        status: "CREATE_COMPLETE",
      })
      .assert())
})
