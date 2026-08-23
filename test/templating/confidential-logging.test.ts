import { EjsTemplateEngine } from "../../src/templating/ejs/ejs-template-engine.js"
import { HandlebarsTemplateEngine } from "../../src/templating/handlebars/handlebars-template-engine.js"
import { createLogger, TkmLogger } from "../../src/utils/logging.js"

const sentinel = "CONFIDENTIAL_TEMPLATE_SENTINEL"

const capturingLogger = (): { logger: TkmLogger; messages: string[] } => {
  const messages = new Array<string>()
  const logger = createLogger({
    logLevel: "trace",
    writer: (...args) => messages.push(args.map(String).join(" ")),
  })
  return { logger, messages }
}

describe("Template engine confidential logging", () => {
  test("Handlebars does not log templates, variables, or rendered output by default", async () => {
    const { logger, messages } = capturingLogger()
    const engine = new HandlebarsTemplateEngine({
      projectDir: process.cwd(),
      logger,
    })

    const output = await engine.renderTemplate({
      templateString: `${sentinel}: {{secret}}`,
      variables: { secret: sentinel },
      sourceDescription: "inline",
    })

    expect(output).toContain(sentinel)
    expect(messages.join("\n")).not.toContain(sentinel)
    expect(messages.join("\n")).toContain("*****")
  })

  test("EJS does not log templates, variables, or rendered output by default", async () => {
    const { logger, messages } = capturingLogger()
    const engine = new EjsTemplateEngine({
      projectDir: process.cwd(),
      logger,
    })

    const output = await engine.renderTemplate({
      templateString: `${sentinel}: <%= it.secret %>`,
      variables: { secret: sentinel },
      sourceDescription: "inline",
    })

    expect(output).toContain(sentinel)
    expect(messages.join("\n")).not.toContain(sentinel)
    expect(messages.join("\n")).toContain("*****")
  })

  test("logs template details when explicitly enabled", async () => {
    const { logger, messages } = capturingLogger()
    const engine = new HandlebarsTemplateEngine({
      projectDir: process.cwd(),
      logger,
      confidentialValuesLoggingEnabled: true,
    })

    await engine.renderTemplate({
      templateString: "{{secret}}",
      variables: { secret: sentinel },
      sourceDescription: "inline",
    })

    expect(messages.join("\n")).toContain(sentinel)
  })

  test("does not include template contents in rendering errors by default", async () => {
    const { logger, messages } = capturingLogger()
    const engine = new HandlebarsTemplateEngine({
      projectDir: process.cwd(),
      logger,
    })

    const result = engine.renderTemplate({
      templateString: `${sentinel}: {{missing}}`,
      variables: {},
      sourceDescription: "inline",
    })

    await expect(result).rejects.not.toThrow(sentinel)
    expect(messages.join("\n")).not.toContain(sentinel)
  })
})
