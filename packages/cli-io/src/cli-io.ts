import { IO, Options } from "@takomo/core"
import { BaseLogger, bold, indentLines, LogWriter } from "@takomo/util"
import inquirer from "inquirer"

export interface Choice<T> {
  readonly name: string
  readonly value: T
}

interface QuestionOptions {
  validate?: (input: any) => string | boolean
  filter?: (input: any) => any
}

// eslint-disable-next-line
inquirer.registerPrompt("autocomplete", require("inquirer-autocomplete-prompt"))

export default class CliIO extends BaseLogger implements IO {
  protected readonly options: Options
  private readonly logWriter: LogWriter

  constructor(
    logWriter: LogWriter,
    options: Options,
    loggerName: string | null = null,
  ) {
    super(logWriter, options.getLogLevel(), loggerName)
    this.options = options
    this.logWriter = logWriter
  }

  print(message?: any, ...optionalParams: any[]): void {
    this.logWriter(message || "", ...optionalParams)
  }

  subheader = (
    message: string,
    marginTop = false,
    marginBottom = false,
    indent = 0,
  ): void => {
    const padding = " ".repeat(indent)
    this.message(padding + bold(message), marginTop)
    this.message(
      padding + bold("-".repeat(message.length)),
      false,
      marginBottom,
    )
  }

  header = (message: string, marginTop = false, marginBottom = false): void => {
    this.message(bold(message), marginTop)
    this.message(bold("=".repeat(message.length)), false, marginBottom)
  }

  message = (
    message: any = "",
    marginTop = false,
    marginBottom = false,
  ): void => {
    if (marginTop) {
      this.print()
    }
    this.print(message)
    if (marginBottom) {
      this.print()
    }
  }

  longMessage = (
    lines: string[],
    marginTop = false,
    marginBottom = false,
    indent = 0,
  ): void => {
    if (marginTop) {
      this.print()
    }

    this.print(indentLines(lines.join("\n"), indent))
    if (marginBottom) {
      this.print()
    }
  }

  multilineMessage = (
    message: string,
    marginTop = false,
    marginBottom = false,
    indent = 0,
  ): void => {
    if (marginTop) {
      this.print()
    }

    this.print(indentLines(message, indent))
    if (marginBottom) {
      this.print()
    }
  }

  confirm = async (message: string, marginTop = false): Promise<boolean> => {
    if (marginTop) {
      this.print()
    }

    const { answer } = await inquirer.prompt([
      {
        message,
        name: "answer",
        type: "confirm",
      },
    ])

    return answer
  }

  question = async (
    message: string,
    marginTop = false,
    options: QuestionOptions = {},
  ): Promise<string> => {
    if (marginTop) {
      this.print()
    }

    const { answer } = await inquirer.prompt([
      {
        ...options,
        message,
        type: "input",
        name: "answer",
      },
    ])

    return answer
  }

  choose = async <T>(
    message: string,
    choices: Choice<T>[],
    marginTop = false,
  ): Promise<T> => {
    if (marginTop) {
      this.print()
    }

    const { answer } = await inquirer.prompt([
      {
        choices,
        message,
        name: "answer",
        type: "list",
      },
    ])

    return answer
  }

  chooseMany = async <T>(
    message: string,
    choices: Choice<T>[],
    marginTop = false,
  ): Promise<T[]> => {
    if (marginTop) {
      this.print()
    }

    const { answer } = await inquirer.prompt([
      {
        choices,
        message,
        name: "answer",
        type: "checkbox",
      },
    ])

    return answer
  }

  autocomplete = async (
    message: string,
    source: (answersSoFar: any, input: string) => Promise<string[]>,
  ): Promise<string> => {
    const { answer } = await inquirer.prompt([
      {
        message,
        source,
        name: "answer",
        type: "autocomplete",
        pageSize: 10,
      },
    ])

    return answer
  }
}
