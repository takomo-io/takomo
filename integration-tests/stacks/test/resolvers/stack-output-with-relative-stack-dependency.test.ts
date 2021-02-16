import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/resolvers/stack-output-with-relative-dependency"
const stacks = [
  {
    stackPath: "/eu-central-1/vpc.yml/eu-central-1",
    stackName: "eu-central-1-vpc",
  },
  {
    stackPath: "/eu-central-1/security-groups.yml/eu-central-1",
    stackName: "eu-central-1-security-groups",
  },
  {
    stackPath: "/eu-north-1/vpc/vpc.yml/eu-north-1",
    stackName: "eu-north-1-vpc-vpc",
  },
  {
    stackPath: "/eu-north-1/sg/security-groups.yml/eu-north-1",
    stackName: "eu-north-1-sg-security-groups",
  },
  { stackPath: "/eu-west-1/vpc.yml/eu-west-1", stackName: "eu-west-1-vpc" },
  {
    stackPath: "/eu-west-1/example/security-groups.yml/eu-west-1",
    stackName: "eu-west-1-example-security-groups",
  },
]

describe("Stack output resolvers with relative dependencies", () => {
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
