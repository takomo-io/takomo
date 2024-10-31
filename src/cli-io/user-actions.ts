import { search, confirm, checkbox, select } from "@inquirer/prompts"
import { Choice } from "./cli-io.js"

export interface UserActions {
  confirm: (message: string, marginTop: boolean) => Promise<boolean>
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
    source: (input?: string) => Promise<string[]>,
  ) => Promise<string>
}

export const createInquirerUserActions = (print: () => void): UserActions => ({
  choose: async <T>(
    message: string,
    choices: Choice<T>[],
    marginTop = false,
  ): Promise<T> => {
    if (marginTop) {
      print()
    }

    return select({
      choices,
      message,
    })
  },

  chooseMany: async <T>(
    message: string,
    choices: Choice<T>[],
    marginTop = false,
  ): Promise<T[]> => {
    if (marginTop) {
      print()
    }

    return checkbox({
      choices,
      message,
    })
  },

  autocomplete: async (
    message: string,
    source: (input?: string) => Promise<string[]>,
  ): Promise<string> => {
    const answer = await search({
      message,
      source,
      pageSize: 10,
    })

    return String(answer)
  },

  confirm: async (message: string, marginTop = false): Promise<boolean> => {
    if (marginTop) {
      print()
    }

    return confirm({
      message,
    })
  },
})
