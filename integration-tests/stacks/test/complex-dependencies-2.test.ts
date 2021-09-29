import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/complex-dependencies-2"

const stacks = [
  "/e/eu-north-1/a-2.yml/eu-north-1",
  "/e/eu-north-1/a-3.yml/eu-north-1",
  "/e/eu-north-1/a-4.yml/eu-north-1",
  "/e/eu-north-1/a-5.yml/eu-north-1",
  "/e/eu-west-1/a-19.yml/eu-west-1",
  "/e/eu-west-1/a-2.yml/eu-west-1",
  "/e/eu-west-1/a-3.yml/eu-west-1",
  "/e/eu-west-1/a-5.yml/eu-west-1",
  "/e/us-east-1/a-2.yml/us-east-1",
  "/e/us-east-1/a-5.yml/us-east-1",
  "/e/us-east-1/a-d.yml/us-east-1",
  "/x/eu-west-1/a-2.yml/eu-west-1",
  "/x/us-east-1/a-2.yml/us-east-1",
  "/x/us-east-1/a-32.yml/us-east-1",
  "/x/us-east-1/a-d.yml/us-east-1",
  "/e/eu-north-1/a-1.yml/eu-north-1",
  "/e/eu-west-1/a-13.yml/eu-west-1",
  "/e/eu-west-1/a-c.yml/eu-west-1",
  "/e/us-east-1/a-c.yml/us-east-1",
  "/x/us-east-1/a-c.yml/us-east-1",
  "/e/eu-west-1/a-6.yml/eu-west-1",
  "/e/eu-west-1/a-8.yml/eu-west-1",
  "/e/eu-west-1/a-14.yml/eu-west-1",
  "/e/eu-west-1/a-25.yml/eu-west-1",
  "/e/eu-west-1/a-34.yml/eu-west-1",
  "/e/eu-west-1/a-7.yml/eu-west-1",
  "/e/us-east-1/a-32.yml/us-east-1",
  "/e/eu-west-1/a-18.yml/eu-west-1",
  "/e/eu-west-1/a-26.yml/eu-west-1",
  "/e/eu-west-1/a-29.yml/eu-west-1",
  "/e/eu-west-1/a-30.yml/eu-west-1",
  "/e/eu-west-1/a-9.yml/eu-west-1",
  "/e/eu-west-1/a-15.yml/eu-west-1",
  "/e/eu-west-1/a-17.yml/eu-west-1",
  "/e/eu-west-1/a-24.yml/eu-west-1",
  "/e/eu-west-1/a-27.yml/eu-west-1",
  "/e/eu-west-1/a-28.yml/eu-west-1",
  "/x/eu-west-1/a-33.yml/eu-west-1",
  "/e/eu-west-1/a-16.yml/eu-west-1",
  "/e/eu-west-1/a-20.yml/eu-west-1",
  "/e/eu-west-1/a-22.yml/eu-west-1",
  "/e/eu-west-1/a-12.yml/eu-west-1",
  "/e/eu-west-1/a-23.yml/eu-west-1",
].map((stackPath) => ({
  stackName: stackPath.split(".")[0].substr(1).replace(/\//g, "-"),
  stackPath,
}))

describe("Complex dependencies 2", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(...stacks)
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(...stacks)
      .assert())
})
