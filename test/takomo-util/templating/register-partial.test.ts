import { createTemplateEngine } from "../../../src/takomo-util"

describe("#registerPartial", () => {
  test("ok", () => {
    const te = createTemplateEngine()
    te.registerPartial("my-partial", "hello {{person}}!", "some source")
    const rendered = te.renderTemplate("{{> my-partial}}", { person: "Papa" })
    expect(rendered).toStrictEqual("hello Papa!")
  })

  test("registering with existing name", () => {
    const te = createTemplateEngine()
    te.registerPartial("example", "partial string", "some source")

    expect(() =>
      te.registerPartial("example", "partial string", "some source"),
    ).toThrow("Partial with name 'example' already registered from some source")
  })
})
