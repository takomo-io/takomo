import { executeEmitStackTemplatesCommand } from "../../src/commands/stacks.js"
import { withSingleAccountReservation } from "../../src/reservations.js"
import { pathToConfigs } from "../../src/util.js"
import {
  createDir,
  readFileContents,
  removeDir,
} from "../../../src/utils/files.js"
import path from "path"
import os from "os"
import { executeWithCli } from "../../src/cli/execute.js"

const projectDir = pathToConfigs("list-stacks"),
  pathToVpcTemplate = path.join(projectDir, "templates", "vpc1.yml"),
  pathToSgTemplate = path.join(projectDir, "templates", "security-groups1.yml"),
  vpcStackName = "vpc1",
  vpcStackPath = "/vpc1.yml/eu-west-1",
  sgStackName = "security-groups1",
  sgStackPath = "/security-groups1.yml/eu-west-1",
  customStackName = "my-custom",
  customStackPath = "/my-custom.yml/eu-west-1",
  outDir = path.join(os.tmpdir(), `takomo-${Date.now()}`)

beforeAll(async () => {
  console.log(`Using out dir: ${outDir}`)
  await createDir(outDir)
})
afterAll(async () => await removeDir(outDir))

describe("Emit with multiple stacks", () => {
  test.only(
    "All stacks",
    withSingleAccountReservation(async () => {
      await executeEmitStackTemplatesCommand({
        projectDir,
        skipHooks: true,
        skipParameters: true,
        outDir,
      })
        .expectCommandToSucceed()
        .expectStackTemplate({
          stackName: vpcStackName,
          stackPath: vpcStackPath,
          templateBody: await readFileContents(pathToVpcTemplate),
        })
        .expectStackTemplate({
          stackName: sgStackName,
          stackPath: sgStackPath,
          templateBody: await readFileContents(pathToSgTemplate),
        })
        .expectNoStackTemplate({
          stackName: customStackName,
          stackPath: customStackPath,
        })
        .assert()

      expect(
        await readFileContents(path.join(outDir, "vpc1.yml-eu-west-1")),
      ).toStrictEqual(await readFileContents(pathToVpcTemplate))

      expect(
        await readFileContents(
          path.join(outDir, "security-groups1.yml-eu-west-1"),
        ),
      ).toStrictEqual(await readFileContents(pathToSgTemplate))
    }),
  )

  test("Emit all stacks using cli", async () =>
    await executeWithCli(
      `node bin/tkm.mjs stacks emit --quiet -y -d ${projectDir} --skip-hooks --skip-parameters`,
    )
      .expectText(
        "\n" +
          (await readFileContents(pathToVpcTemplate)) +
          "\n" +
          "\n" +
          (await readFileContents(pathToSgTemplate)) +
          "\n",
      )
      .assert())

  test("Emit single stack using cli", async () =>
    await executeWithCli(
      `node bin/tkm.mjs stacks emit --quiet -y -d ${projectDir} --skip-hooks --skip-parameters /vpc1.yml`,
    )
      .expectText("\n" + (await readFileContents(pathToVpcTemplate)) + "\n")
      .assert())

  test("Emit single stack with dependencies using cli", async () =>
    await executeWithCli(
      `node bin/tkm.mjs stacks emit --quiet -y -d ${projectDir} --skip-hooks --skip-parameters /security-groups1.yml`,
    )
      .expectText(
        "\n" +
          (await readFileContents(pathToVpcTemplate)) +
          "\n" +
          "\n" +
          (await readFileContents(pathToSgTemplate)) +
          "\n",
      )
      .assert())

  test("Emit single stack and ignore dependencies using cli", async () =>
    await executeWithCli(
      `node bin/tkm.mjs stacks emit --quiet -y -d ${projectDir} --skip-hooks --skip-parameters --ignore-dependencies /security-groups1.yml`,
    )
      .expectText("\n" + (await readFileContents(pathToSgTemplate)) + "\n")
      .assert())
})
