import {
  ExecuteCommandProps,
  executeDeployStacksCommand,
} from "@takomo/test-integration"

const props: ExecuteCommandProps = {
  projectDir: "configs/templating",
  varFile: ["queues.yml"],
}

describe("Templating", () => {
  test("Deploy", () =>
    executeDeployStacksCommand(props)
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/queues.yml/eu-north-1",
        stackName: "queues",
      })
      .expectStackCreateSuccess({
        stackPath: "/topics.yml/eu-north-1",
        stackName: "topics",
      })
      .expectStackCreateSuccess({
        stackPath: "/not-dynamic.yml/eu-north-1",
        stackName: "not-dynamic",
      })
      .expectStackCreateSuccess({
        stackPath: "/another-not-dynamic.yml/eu-north-1",
        stackName: "another-not-dynamic",
      })
      .expectStackCreateSuccess({
        stackPath: "/dynamic.yml/eu-north-1",
        stackName: "dynamic",
      })
      .expectStackCreateSuccess({
        stackPath: "/parameters.yml/eu-north-1",
        stackName: "parameters",
      })
      .expectDeployedCfStackV2({
        stackPath: "/parameters.yml/eu-north-1",
        outputs: {
          ParamA: "one",
          ParamB: "two",
          ParamC: "three",
          ParamD: "foo,bar,baz",
          OutMap: "foo,bar,baz",
        },
      })
      .expectDeployedCfStackV2({
        stackPath: "/queues.yml/eu-north-1",
        outputs: {
          NumberParam: "300",
          HelloParam: "World",
        },
        description: "IT - templating World",
      })
      .expectDeployedCfStackV2({
        stackPath: "/dynamic.yml/eu-north-1",
        description: "dynamic",
      })
      .expectDeployedCfStackV2({
        stackPath: "/not-dynamic.yml/eu-north-1",
        description: "String with handlebars syntax {{ var.hello }}",
      })
      .expectDeployedCfStackV2({
        stackPath: "/another-not-dynamic.yml/eu-north-1",
        description: "Another string with handlebars syntax {{ var.hello }}",
      })
      .assert())
})
