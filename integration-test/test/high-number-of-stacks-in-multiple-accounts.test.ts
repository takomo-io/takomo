/**
 * @testenv-recycler-count 3
 */
import R from "ramda"
import { sleep } from "../../src/takomo-util"
import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks"

const projectDir = `${process.cwd()}/integration-test/configs/high-number-of-stacks-in-multiple-accounts`

const regions = ["us-east-1", "us-west-1", "eu-north-1"]

const makeStacks = (
  stackGroup: string,
  from: number,
  to: number,
): ReadonlyArray<{ stackName: string; stackPath: string }> =>
  R.range(from, to + 1)
    .map((n) => `${n}`)
    .map((n) => n.padStart(2, "0"))
    .map((n) => `stack${n}`)
    .map((n) =>
      regions.map((r) => ({
        stackPath: `/${stackGroup}/${n}.yml/${r}`,
        stackName: `${stackGroup}-${n}`,
      })),
    )
    .flat()

const stacks = [
  ...makeStacks("account1", 1, 6),
  ...makeStacks("account2", 7, 14),
  ...makeStacks("account3", 15, 20),
]

describe("High number of stacks in multiple accounts", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["prefix=a"],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(...stacks)
      .assert())

  test("Deploy without changes", async () => {
    await sleep(5000)
    await executeDeployStacksCommand({
      projectDir,
      var: ["prefix=a"],
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges(...stacks)
      .assert()
  })

  test("Deploy with changes", async () => {
    await sleep(5000)
    await executeDeployStacksCommand({
      projectDir,
      var: ["prefix=b"],
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccess(...stacks)
      .assert()
  })

  test("Undeploy", async () => {
    await sleep(5000)
    await executeUndeployStacksCommand({
      projectDir,
      var: ["prefix=b"],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(...stacks)
      .assert()
  })
})
