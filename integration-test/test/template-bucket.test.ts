import { uuid } from "../../src/utils/strings.js"
import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/template-bucket`

const bucketName = "template-bucket" + uuid()

describe("Template bucket", () => {
  test("Deploy template bucket", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/common",
      var: [`name=${bucketName}=`],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/common/bucket.yml/eu-north-1",
        stackName: "common-bucket",
      })
      .assert())

  test("Deploy using template bucket", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/app/app.yml",
      var: [`name=${bucketName}`],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/app/app.yml/eu-north-1",
        stackName: "app-app",
      })
      .assert())

  test("Deploy using template bucket with prefix", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/app/db.yml",
      var: [`name=${bucketName}`],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/app/db.yml/eu-north-1",
        stackName: "app-db",
      })
      .assert())
})
