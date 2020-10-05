import { createRootStackGroup } from "../../../../src/config/create-root-stack-group"
import { createStackGroupFromParent } from "../../../../src/config/create-stack-group-from-parent"
import { makeStackGroupPath } from "../../../../src/config/make-stack-group-path"

describe("make stack group path", () => {
  test("for a stack group directly under the root stack group", () => {
    const root = createRootStackGroup()
    const path = makeStackGroupPath("/tmp/projects/stacks/dev", root)
    expect(path).toEqual("/dev")
  })

  test("for a stack group not directly under the root stack group", () => {
    const root = createRootStackGroup()
    const parent = createStackGroupFromParent(
      {
        dir: { fullPath: "/tmp/projects/stacks/dev", basename: "dev" },
        path: "/dev",
        children: [],
        stacks: [],
      },
      root,
    )
    const path = makeStackGroupPath(
      "/tmp/projects/stacks/dev/eu-west-1",
      parent,
    )
    expect(path).toEqual("/dev/eu-west-1")
  })
})
