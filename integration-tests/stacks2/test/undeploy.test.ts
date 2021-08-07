import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/undeploy"
const stacks = [
  {
    stackPath: "/foo.yml/eu-west-1",
    stackName: "foo",
  },
  {
    stackPath: "/bar.yml/eu-west-1",
    stackName: "bar",
  },
  {
    stackPath: "/baz.yml/eu-west-1",
    stackName: "baz",
  },
  {
    stackPath: "/others/one.yml/eu-west-1",
    stackName: "others-one",
  },
  {
    stackPath: "/others/two.yml/eu-west-1",
    stackName: "others-two",
  },
]

describe("Undeploy", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(...stacks)
      .assert())

  test("Undeploy '/baz.yml' should not undeploy other stacks", () =>
    executeUndeployStacksCommand({
      projectDir,
      commandPath: "/baz.yml",
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackPath: "/baz.yml/eu-west-1",
        stackName: "baz",
      })
      .assert())

  test("Undeploy '/foo.yml' should also undeploy '/bar.yml'", () =>
    executeUndeployStacksCommand({
      projectDir,
      commandPath: "/foo.yml",
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(
        {
          stackPath: "/foo.yml/eu-west-1",
          stackName: "foo",
        },
        {
          stackPath: "/bar.yml/eu-west-1",
          stackName: "bar",
        },
      )
      .expectSkippedStackResult({
        message: "Stack not found",
        stackPath: "/baz.yml/eu-west-1",
        stackName: "baz",
      })
      .assert())

  test("Undeploy '/others/one.yml' with ignore dependencies should not undeploy /others/two.yml", () =>
    executeUndeployStacksCommand({
      projectDir,
      commandPath: "/others/one.yml",
      ignoreDependencies: true,
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackPath: "/others/one.yml/eu-west-1",
        stackName: "others-one",
      })
      .assert())
})
