import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/complex-dependencies`

const stacks = [
  ["rds-a", "/rds/a.yml/eu-central-1"],
  ["rds-b", "/rds/b.yml/eu-central-1"],
  ["rds-d", "/rds/d.yml/eu-central-1"],
  ["rds-g", "/rds/g.yml/eu-central-1"],
  ["rds-h", "/rds/h.yml/eu-central-1"],
  ["rds-o", "/rds/o.yml/eu-central-1"],
  ["rds-p", "/rds/p.yml/eu-central-1"],
  ["vpc-c", "/vpc/c.yml/eu-central-1"],
  ["vpc-e", "/vpc/e.yml/eu-central-1"],
  ["vpc-f", "/vpc/f.yml/eu-central-1"],
  ["vpc-k", "/vpc/k.yml/eu-central-1"],
  ["vpc-m", "/vpc/m.yml/eu-central-1"],
  ["vpc-n", "/vpc/n.yml/eu-central-1"],
  ["i", "/i.yml/eu-central-1"],
  ["j", "/j.yml/eu-central-1"],
  ["l", "/l.yml/eu-central-1"],
].map(([stackName, stackPath]) => ({ stackName, stackPath }))

describe("Complex dependencies", () => {
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
