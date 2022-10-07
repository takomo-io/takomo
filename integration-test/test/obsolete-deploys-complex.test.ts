import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks"

const projectDir = `${process.cwd()}/integration-test/configs/prune-stacks-complex`

const stack1 = {
  stackName: "hello-1",
  stackPath: "/hello-1.yml/eu-north-1",
}

const stack2 = {
  stackName: "hello-2",
  stackPath: "/hello-2.yml/eu-north-1",
}

const stack3 = {
  stackName: "hello-3",
  stackPath: "/hello-3.yml/eu-north-1",
}

const stack4 = {
  stackName: "hello-4",
  stackPath: "/hello-4.yml/eu-north-1",
}

const stack5 = {
  stackName: "hello-5",
  stackPath: "/hello-5.yml/eu-north-1",
}

describe("pruning complex stacks", () => {
  test("obsolete stacks are not deployed", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "obsolete1=true",
        "obsolete2=true",
        "obsolete3=true",
        "obsolete4=true",
      ],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(stack5)
      .assert())

  test("prune non-existing obsolete stacks", () =>
    executeUndeployStacksCommand({
      projectDir,
      prune: true,
      var: [
        "obsolete1=true",
        "obsolete2=true",
        "obsolete3=true",
        "obsolete4=true",
      ],
    })
      .expectCommandToSkip("Skipped")
      .expectSkippedStackResult({
        ...stack1,
        message: "Stack not found",
      })
      .expectSkippedStackResult({
        ...stack2,
        message: "Stack not found",
      })
      .expectSkippedStackResult({
        ...stack3,
        message: "Stack not found",
      })
      .expectSkippedStackResult({
        ...stack4,
        message: "Stack not found",
      })
      .assert())

  test("deploy all stacks", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "obsolete1=false",
        "obsolete2=false",
        "obsolete3=false",
        "obsolete4=false",
      ],
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges(stack5)
      .expectStackCreateSuccess(stack1, stack2, stack3, stack4)
      .assert())

  test("prune with command path", () =>
    executeUndeployStacksCommand({
      projectDir,
      prune: true,
      commandPath: "/hello-4.yml",
      var: [
        "obsolete1=false",
        "obsolete2=false",
        "obsolete3=true",
        "obsolete4=true",
      ],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(stack4)
      .assert())

  test("prune again", () =>
    executeUndeployStacksCommand({
      projectDir,
      prune: true,
      var: [
        "obsolete1=false",
        "obsolete2=false",
        "obsolete3=true",
        "obsolete4=true",
      ],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(stack3)
      .expectSkippedStackResult({
        ...stack4,
        message: "Stack not found",
      })
      .assert())

  test("prune remaining with command path", () =>
    executeUndeployStacksCommand({
      projectDir,
      commandPath: "/hello-2.yml",
      prune: true,
      var: [
        "obsolete1=true",
        "obsolete2=true",
        "obsolete3=true",
        "obsolete4=true",
      ],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(stack1, stack2)
      .expectSkippedStackResult({
        ...stack3,
        message: "Stack not found",
      })
      .expectSkippedStackResult({
        ...stack4,
        message: "Stack not found",
      })
      .assert())
})
