import { bold } from "../utils/colors.js"
import { LogWriter } from "../utils/logging.js"
import { indentLines } from "../utils/strings.js"
import { createInquirerUserActions, UserActions } from "./user-actions.js"

export interface Choice<T> {
  readonly name: string
  readonly value: T
}

interface MessageProps {
  readonly text: string
  readonly marginTop?: boolean
  readonly marginBottom?: boolean
  readonly indent?: number
  readonly transform?: (msg: string) => string
}

export interface BaseIO extends UserActions {
  print: (text?: any, ...optionalParams: any[]) => void
  subheader: (props: MessageProps) => void
  header: (props: MessageProps) => void
  message: (props: MessageProps) => void
  longMessage: (
    lines: ReadonlyArray<string>,
    marginTop: boolean,
    marginBottom: boolean,
    indent: number,
  ) => void
}

export interface BaseIOProps {
  readonly writer?: LogWriter
  readonly actions?: UserActions
}

export const createBaseIO = ({
  writer = console.log,
  actions,
}: BaseIOProps): BaseIO => {
  const print = (text: unknown = "", ...optionalParams: unknown[]): void => {
    writer(text, ...optionalParams)
  }

  const message = ({
    text,
    marginTop = false,
    marginBottom = false,
    indent = 0,
    transform = (msg) => msg,
  }: MessageProps): void => {
    if (marginTop) {
      print()
    }

    const padding = " ".repeat(indent)
    text
      .split("\n")
      .map((line) => `${padding}${line}`)
      .forEach((line) => print(transform(line)))

    if (marginBottom) {
      print()
    }
  }

  const userActions = actions ?? createInquirerUserActions(print)

  return {
    ...userActions,
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
      lines: ReadonlyArray<string>,
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
  }
}
