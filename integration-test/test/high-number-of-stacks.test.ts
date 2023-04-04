import * as R from "ramda"
import { sleep } from "../../src/utils/system.js"
import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/high-number-of-stacks`

const regions = ["eu-west-1", "eu-central-1", "eu-north-1"]
const stacks = R.range(1, 21)
  .map((n) => `${n}`)
  .map((n) => n.padStart(2, "0"))
  .map((n) => `stack${n}`)
  .map((n) =>
    regions.map((r) => ({
      stackPath: `/${n}.yml/${r}`,
      stackName: n,
    })),
  )
  .flat()

// Skipped due to test fragility in GitHub Actions
describe("High number of stacks", () => {
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

  // Undeploy fails due to this error:
  //   A conflicting operation is currently in progress against this resource.
  //   Please try again. (Service: CloudWatchLogs, Status Code: 400, Request ID: xxxxx, Extended Request ID: null)
  // test("Undeploy", async () => {
  //   await sleep(20000)
  //   await executeUndeployStacksCommand({
  //     projectDir,
  //     var: ["prefix=b"],
  //   })
  //     .expectCommandToSucceed()
  //     .expectStackDeleteSuccess(...stacks)
  //     .assert()
  // })
})
