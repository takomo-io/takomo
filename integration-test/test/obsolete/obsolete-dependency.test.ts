import { executeDeployStacksCommand } from "../../src/commands/stacks.js"
import { pathToConfigs } from "../../src/util.js"

const projectDir = pathToConfigs("obsolete", "obsolete-dependency")

describe("deploying stacks", () => {
  test("fails if stack depends on obsolete stack", () =>
    executeDeployStacksCommand({ projectDir }).expectCommandToThrow(
      "Dependencies to obsolete stacks detected.\n\n" +
        "The following 1 stack(s) depend on stacks marked as obsolete:\n\n" +
        "  /s2.yml/eu-north-1:\n" +
        "    - /s1.yml/eu-north-1 (marked as obsolete)\n",
    ))
})
