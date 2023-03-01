import { join } from "path"
import { HandlebarsTemplateEngine } from "../../src/templating/handlebars/handlebars-template-engine.js"
import { logger } from "../logger.js"

const pathToPartial = join(process.cwd(), "test", "templating", "partial.txt")

const templateEngine = () =>
  new HandlebarsTemplateEngine({
    projectDir: process.cwd(),
    logger,
  })

describe("HandlebarsTemplateEngine", () => {
  describe("#registerPartial", () => {
    test("success", async () => {
      const te = templateEngine()
      await te.registerPartial("my-partial", pathToPartial)
      const rendered = await te.renderTemplate({
        templateString: "{{> my-partial}}",
        variables: {
          person: "Papa",
        },
      })
      expect(rendered).toStrictEqual("hello Papa!\n")
    })

    test("registering with existing name should fail", async () => {
      const te = templateEngine()
      await te.registerPartial("example", pathToPartial)

      await expect(() =>
        te.registerPartial("example", pathToPartial),
      ).rejects.toThrow(
        `Partial with name 'example' already registered from ${pathToPartial}`,
      )
    })
  })

  describe("#renderTemplateFile", () => {
    test("success", async () => {
      const te = templateEngine()
      const rendered = await te.renderTemplateFile({
        pathToFile: pathToPartial,
        variables: { person: "Zorro" },
      })

      expect(rendered).toEqual("hello Zorro!\n")
    })
  })

  describe("#renderTemplate", () => {
    test("success", async () => {
      const te = templateEngine()
      const rendered = await te.renderTemplate({
        templateString: "Beware of {{person}}",
        variables: { person: "Zorro" },
      })

      expect(rendered).toEqual("Beware of Zorro")
    })
  })
})
