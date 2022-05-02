import { executeDeployStacksCommand } from "@takomo/test-integration"

describe("Tag inheritance", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir: "configs/tag-inheritance",
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(
        {
          stackName: "three",
          stackPath: "/three.yml/eu-north-1",
          expectDeployedStack: {
            tags: {
              foo: "bar",
              fux: "baz",
              hello: "world",
            },
          },
        },
        {
          stackName: "aaa-two",
          stackPath: "/aaa/two.yml/eu-north-1",
          expectDeployedStack: {
            tags: {
              foo: "bar1",
              fux: "baz",
              hello: "world",
            },
          },
        },
        {
          stackName: "aaa-bbb-one",
          stackPath: "/aaa/bbb/one.yml/eu-north-1",
          expectDeployedStack: {
            tags: {
              foo: "bar1",
              fux: "new-value",
              hello: "world",
            },
          },
        },
      )
      .assert())
})
