import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks"

const projectDir = `${process.cwd()}/integration-test/configs/relative-dependencies`

const stacks = [
  { stackPath: "/foo/bar/baz/a.yml/eu-west-1", stackName: "foo-bar-baz-a" },
  { stackPath: "/hello/world/b.yml/eu-west-1", stackName: "hello-world-b" },
  { stackPath: "/c.yml/eu-west-1", stackName: "c" },
  { stackPath: "/foo/bar/d.yml/eu-west-1", stackName: "foo-bar-d" },
  { stackPath: "/hello/world/e.yml/eu-west-1", stackName: "hello-world-e" },
]

describe("Relative dependencies", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(...stacks)
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(...stacks)
      .assert())
})
