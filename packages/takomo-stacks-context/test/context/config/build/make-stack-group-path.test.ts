import {
  createRootStackGroup,
  createStackGroupFromParent,
  makeStackGroupPath,
} from "../../../../src/config/build"

describe("make stack group path", () => {
  test("for a stack group directly under the root stack group", () => {
    const root = createRootStackGroup()
    const path = makeStackGroupPath("/tmp/projects/config/dev", root)
    expect(path).toEqual("/dev")
  })

  test("for a stack group not directly under the root stack group", () => {
    const root = createRootStackGroup()
    const parent = createStackGroupFromParent("/tmp/projects/config/dev", root)
    const path = makeStackGroupPath(
      "/tmp/projects/config/dev/eu-west-1",
      parent,
    )
    expect(path).toEqual("/dev/eu-west-1")
  })
})
