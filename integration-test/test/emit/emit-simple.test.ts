import { executeEmitStackTemplatesCommand } from "../../src/commands/stacks.js"
import { withSingleAccountReservation } from "../../src/reservations.js"
import { pathToConfigs } from "../../src/util.js"
import { readFileContents } from "../../../src/utils/files.js"
import path from "path"
import { executeWithCli } from "../../src/cli/execute.js"

const projectDir = pathToConfigs("simple"),
  pathToTemplate = path.join(projectDir, "templates", "vpc.yml"),
  stackName = "simple-vpc",
  stackPath = "/vpc.yml/eu-central-1"

describe("Simple emit", () => {
  test(
    "Single stack",
    withSingleAccountReservation(async () =>
      executeEmitStackTemplatesCommand({
        projectDir,
      })
        .expectCommandToSucceed()
        .expectStackTemplate({
          stackName,
          stackPath,
          templateBody: await readFileContents(pathToTemplate),
        })
        .assert(),
    ),
  )

  test.only("Emit with cli", async () =>
    await executeWithCli(
      `node bin/tkm.mjs stacks emit --quiet -y -d ${projectDir}`,
    )
      .expectText("\n" + (await readFileContents(pathToTemplate)) + "\n")
      .assert())
})
