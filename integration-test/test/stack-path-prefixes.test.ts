import {
  executeDeployStacksCommand,
  executeDetectDriftCommand,
  executeListStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/stack-path-prefixes`
const developmentCidrBlockVar = "developmentCidrBlock=10.1.0.0/24"

const devStack = {
  stackName: "dev-vpc",
  stackPath: "/dev/vpc.yml/eu-north-1",
}

const developmentStack = {
  stackName: "development-vpc",
  stackPath: "/development/vpc.yml/eu-north-1",
}

describe("Stack path sibling prefixes", () => {
  test("Deploy all stacks", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [developmentCidrBlockVar],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(devStack, developmentStack)
      .assert())

  test("Deploying '/dev' neither loads nor deploys '/development'", () =>
    executeDeployStacksCommand({ projectDir, commandPath: "/dev" })
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges(devStack)
      .assert())

  test("Listing '/dev' excludes '/development'", () =>
    executeListStacksCommand({
      projectDir,
      commandPath: "/dev",
      var: [developmentCidrBlockVar],
    })
      .expectOutputToBeSuccessful()
      .expectStack({ ...devStack, status: "CREATE_COMPLETE" })
      .assert())

  test("Detecting drift in '/dev' excludes '/development'", () =>
    executeDetectDriftCommand({
      projectDir,
      commandPath: "/dev",
      var: [developmentCidrBlockVar],
    })
      .expectCommandToSucceed()
      .expectStack({
        ...devStack,
        status: "CREATE_COMPLETE",
        detectionStatus: "DETECTION_COMPLETE",
        stackDriftStatus: "IN_SYNC",
        driftedStackResourceCount: 0,
      })
      .assert())

  test("Undeploying '/dev' does not undeploy '/development'", () =>
    executeUndeployStacksCommand({
      projectDir,
      commandPath: "/dev",
      var: [developmentCidrBlockVar],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(devStack)
      .assert())

  test("The '/development' stack remains deployed", () =>
    executeListStacksCommand({
      projectDir,
      commandPath: "/development",
      var: [developmentCidrBlockVar],
    })
      .expectOutputToBeSuccessful()
      .expectStack({ ...developmentStack, status: "CREATE_COMPLETE" })
      .assert())

  test("Undeploy the remaining stack", () =>
    executeUndeployStacksCommand({
      projectDir,
      commandPath: "/development",
      var: [developmentCidrBlockVar],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(developmentStack)
      .assert())
})
