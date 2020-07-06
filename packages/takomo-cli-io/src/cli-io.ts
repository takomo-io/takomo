import { IO, Options } from "@takomo/core"
import { bold, ConsoleLogger, indentLines } from "@takomo/util"
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

export default class CliIO extends ConsoleLogger implements IO {
  protected readonly options: Options

  constructor(options: Options, loggerName: string | null = null) {
    super(options.getLogLevel(), loggerName)
    this.options = options
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
      console.log()
    }
    console.log(message)
    if (marginBottom) {
      console.log()
    }
  }

  longMessage = (
    lines: string[],
    marginTop = false,
    marginBottom = false,
    indent = 0,
  ): void => {
    if (marginTop) {
      console.log()
    }

    console.log(indentLines(lines.join("\n"), indent))
    if (marginBottom) {
      console.log()
    }
  }

  multilineMessage = (
    message: string,
    marginTop = false,
    marginBottom = false,
    indent = 0,
  ): void => {
    if (marginTop) {
      console.log()
    }

    console.log(indentLines(message, indent))
    if (marginBottom) {
      console.log()
    }
  }

  confirm = async (message: string, marginTop = false): Promise<boolean> => {
    if (marginTop) {
      console.log()
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
      console.log()
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
      console.log()
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
      console.log()
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
