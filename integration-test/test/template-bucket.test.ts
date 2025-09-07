import { uuid } from "../../src/utils/strings.js"
import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/template-bucket`
const bucketName = "template-bucket" + uuid()

// TODO: Fix this test
describe.skip("Template bucket", () => {
  test("Deploy template buckets", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/common",
      var: [`name=${bucketName}`],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/common/bucket.yml/eu-north-1",
        stackName: "common-bucket",
      })
      .expectStackCreateSuccess({
        stackPath: "/common/bucket-eu-west-1.yml/eu-west-1",
        stackName: "common-bucket-eu-west-1",
      })
      .expectStackCreateSuccess({
        stackPath: "/common/bucket-us-east-1.yml/us-east-1",
        stackName: "common-bucket-us-east-1",
      })
      .assert())

  test("Deploy using template buckets", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/app",
      var: [`name=${bucketName}`],
      logLevel: "debug",
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/app/app.yml/eu-north-1",
        stackName: "app-app",
      })
      .expectStackCreateSuccess({
        stackPath: "/app/db.yml/eu-north-1",
        stackName: "app-db",
      })
      .expectStackCreateSuccess({
        stackPath: "/app/db-eu-west-1.yml/eu-north-1",
        stackName: "app-db-eu-west-1",
      })
      .expectStackCreateSuccess({
        stackPath: "/app/db-us-east-1.yml/eu-north-1",
        stackName: "app-db-us-east-1",
      })
      .assert())
})
