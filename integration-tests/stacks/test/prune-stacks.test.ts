import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/prune-stacks"

describe("prune obsolete stacks", () => {
  test("deploy all", () =>
    executeDeployStacksCommand({ projectDir, var: ["obsolete=false"] })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(
        {
          stackName: "s1",
          stackPath: "/s1.yml/eu-north-1",
        },
        {
          stackName: "s2",
          stackPath: "/s2.yml/eu-north-1",
        },
        {
          stackName: "aaa-s3",
          stackPath: "/aaa/s3.yml/eu-north-1",
        },
        {
          stackName: "aaa-s4",
          stackPath: "/aaa/s4.yml/eu-north-1",
        },
        {
          stackName: "bbb-s5",
          stackPath: "/bbb/s5.yml/eu-north-1",
        },
        {
          stackName: "bbb-s6",
          stackPath: "/bbb/s6.yml/eu-north-1",
        },
      )
      .assert())

  test("prune undeploys only obsolete stacks", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["obsolete=true"],
      prune: true,
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(
        {
          stackName: "s1",
          stackPath: "/s1.yml/eu-north-1",
        },
        {
          stackName: "aaa-s3",
          stackPath: "/aaa/s3.yml/eu-north-1",
        },
        {
          stackName: "aaa-s4",
          stackPath: "/aaa/s4.yml/eu-north-1",
        },
        {
          stackName: "bbb-s6",
          stackPath: "/bbb/s6.yml/eu-north-1",
        },
      )
      .assert())
})
