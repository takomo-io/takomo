import inquirer from "inquirer"
import inquirerPrompt from "inquirer-autocomplete-prompt"
import { Choice } from "./cli-io.js"

inquirer.registerPrompt("autocomplete", inquirerPrompt)

export interface QuestionOptions {
  validate?: (input: any) => string | boolean
  filter?: (input: any) => any
}

export interface UserActions {
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

export const createInquirerUserActions = (print: () => void): UserActions => ({
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
})
