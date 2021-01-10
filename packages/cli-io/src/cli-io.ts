import { bold, indentLines, LogWriter } from "@takomo/util"
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

interface MessageProps {
  readonly text: string
  readonly marginTop?: boolean
  readonly marginBottom?: boolean
  readonly indent?: number
}

export interface BaseIO {
  print: (text?: any, ...optionalParams: any[]) => void
  subheader: (props: MessageProps) => void
  header: (props: MessageProps) => void
  message: (props: MessageProps) => void
  longMessage: (
    lines: string[],
    marginTop: boolean,
    marginBottom: boolean,
    indent: number,
  ) => void
  confirm: (message: string, marginTop: boolean) => Promise<boolean>
  question: (
    message: string,
    marginTop: boolean,
    options: QuestionOptions,
  ) => Promise<string>
  choose: <T>(
    message: string,
    choices: Choice<T>[],
    marginTop: boolean,
  ) => Promise<T>
  chooseMany: <T>(
    message: string,
    choices: Choice<T>[],
    marginTop: boolean,
  ) => Promise<T[]>
  autocomplete: (
    message: string,
    source: (answersSoFar: any, input: string) => Promise<string[]>,
  ) => Promise<string>
}

export const createBaseIO = (writer: LogWriter): BaseIO => {
  const print = (text: unknown = "", ...optionalParams: unknown[]): void => {
    writer(text, ...optionalParams)
  }

  const message = ({
    text,
    marginTop = false,
    marginBottom = false,
    indent = 0,
  }: MessageProps): void => {
    if (marginTop) {
      print()
    }
    const padding = " ".repeat(indent)
    print(padding + text)
    if (marginBottom) {
      print()
    }
  }

  return {
    print,
    message,
    header: ({ text, marginBottom, marginTop, indent }: MessageProps) => {
      message({ text: bold(text), indent, marginTop })
      message({ text: bold("=".repeat(text.length)), indent, marginBottom })
    },
    subheader: ({ text, marginBottom, marginTop, indent }: MessageProps) => {
      message({ text: bold(text), indent, marginTop })
      message({ text: bold("-".repeat(text.length)), indent, marginBottom })
    },

    longMessage: (
      lines: string[],
      marginTop = false,
      marginBottom = false,
      indent = 0,
    ) => {
      if (marginTop) {
        print()
      }

      print(indentLines(lines.join("\n"), indent))
      if (marginBottom) {
        print()
      }
    },

    confirm: async (msg: string, marginTop = false): Promise<boolean> => {
      if (marginTop) {
        print()
      }

      const { answer } = await inquirer.prompt([
        {
          message: msg,
          name: "answer",
          type: "confirm",
        },
      ])

      return answer
    },

    question: async (
      msg: string,
      marginTop = false,
      options: QuestionOptions = {},
    ): Promise<string> => {
      if (marginTop) {
        print()
      }

      const { answer } = await inquirer.prompt([
        {
          ...options,
          message: msg,
          type: "input",
          name: "answer",
        },
      ])

      return answer
    },

    choose: async <T>(
      msg: string,
      choices: Choice<T>[],
      marginTop = false,
    ): Promise<T> => {
      if (marginTop) {
        print()
      }

      const { answer } = await inquirer.prompt([
        {
          choices,
          message: msg,
          name: "answer",
          type: "list",
        },
      ])

      return answer
    },

    chooseMany: async <T>(
      msg: string,
      choices: Choice<T>[],
      marginTop = false,
    ): Promise<T[]> => {
      if (marginTop) {
        print()
      }

      const { answer } = await inquirer.prompt([
        {
          choices,
          message: msg,
          name: "answer",
          type: "checkbox",
        },
      ])

      return answer
    },

    autocomplete: async (
      msg: string,
      source: (answersSoFar: any, input: string) => Promise<string[]>,
    ): Promise<string> => {
      const { answer } = await inquirer.prompt([
        {
          message: msg,
          source,
          name: "answer",
          type: "autocomplete",
          pageSize: 10,
        },
      ])

      return answer
    },
  }
}
