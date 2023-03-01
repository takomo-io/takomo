import { mock } from "jest-mock-extended"
import { InternalStack, StackPath } from "../../../src/stacks/stack.js"
import { checkObsoleteDependencies } from "../../../src/takomo-stacks-context/dependencies.js"
import { arrayToMap } from "../../../src/utils/collections.js"

const stack = (
  path: StackPath,
  obsolete: boolean,
  ...dependencies: ReadonlyArray<StackPath>
): InternalStack => mock<InternalStack>({ path, obsolete, dependencies })

const stacksMap = (
  ...stacks: ReadonlyArray<InternalStack>
): Map<StackPath, InternalStack> => arrayToMap(stacks, (s) => s.path)

const doCheckObsoleteDependencies = (
  ...stacks: ReadonlyArray<InternalStack>
): void => {
  checkObsoleteDependencies(stacksMap(...stacks))
}

describe("#checkObsoleteDependencies", () => {
  test("no stacks", () => {
    doCheckObsoleteDependencies()
  })

  test("single non-obsolete stack with no dependencies", () => {
    doCheckObsoleteDependencies(stack("/s1.yml/eu-west-1", false))
  })

  test("many non-obsolete stack with no dependencies", () => {
    doCheckObsoleteDependencies(
      stack("/s1.yml/eu-west-1", false),
      stack("/s2.yml/eu-west-1", false),
    )
  })

  test("single obsolete stack with no dependencies", () => {
    doCheckObsoleteDependencies(stack("/s1.yml/eu-west-1", true))
  })

  test("single obsolete stack with single non-obsolete dependency", () => {
    doCheckObsoleteDependencies(
      stack("/s1.yml/eu-west-1", true, "/s2.yml/eu-west-1"),
    )
  })

  test("single non-obsolete stack with non-obsolete dependencies", () => {
    doCheckObsoleteDependencies(
      stack("/s2.yml/eu-west-1", false),
      stack("/s3.yml/eu-west-1", false),
      stack(
        "/s1.yml/eu-west-1",
        false,
        "/s2.yml/eu-west-1",
        "/s3.yml/eu-west-1",
      ),
    )
  })

  test("single non-obsolete stack with obsolete dependencies", () => {
    expect(() =>
      doCheckObsoleteDependencies(
        stack("/s2.yml/eu-west-1", true),
        stack("/s3.yml/eu-west-1", true),
        stack(
          "/s1.yml/eu-west-1",
          false,
          "/s2.yml/eu-west-1",
          "/s3.yml/eu-west-1",
        ),
      ),
    ).toThrow(
      "Dependencies to obsolete stacks detected.\n\n" +
        "The following 1 stack(s) depend on stacks marked as obsolete:\n\n" +
        "  /s1.yml/eu-west-1:\n" +
        "    - /s2.yml/eu-west-1 (marked as obsolete)\n" +
        "    - /s3.yml/eu-west-1 (marked as obsolete)\n",
    )
  })
})
