import { hooks } from "../src"

describe("hooks validation succeeds", () => {
  test("when an empty list of hooks is given", () => {
    const { error } = hooks.validate([])
    expect(error).toBeUndefined()
  })
  test("when a single hook is given", () => {
    const { error } = hooks.validate([
      {
        name: "MyHook",
        type: "cmd",
      },
    ])
    expect(error).toBeUndefined()
  })
  test("when multiple hooks are given", () => {
    const { error } = hooks.validate([
      {
        name: "MyHook",
        type: "cmd",
      },
      {
        name: "another",
        type: "cmd",
      },
      {
        name: "third-hook",
        type: "cmd",
      },
    ])
    expect(error).toBeUndefined()
  })
})

describe("hooks validation fails", () => {
  test("when two hooks have the same name", () => {
    const { error } = hooks.validate([
      {
        name: "another",
        type: "cmd",
      },
      {
        name: "another",
        type: "cmd",
      },
      {
        name: "third-hook",
        type: "cmd",
      },
    ])
    expect(error.message).toBe(
      '"value"[1] has a non-unique name "another", which is used also by "hooks[0]"',
    )
  })
})
