import { bold, indentLines, LogWriter } from "@takomo/util"
import { createInquirerUserActions, UserActions } from "./user-actions"

/**
 * @hidden
 */
export interface Choice<T> {
  readonly name: string
  readonly value: T
}

interface MessageProps {
  readonly text: string
  readonly marginTop?: boolean
  readonly marginBottom?: boolean
  readonly indent?: number
}

/**
 * @hidden
 */
export interface BaseIO extends UserActions {
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
}

/**
 * @hidden
 */
export interface BaseIOProps {
  readonly writer?: LogWriter
  readonly actions?: UserActions
}

/**
 * @hidden
 */
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
  }
}
