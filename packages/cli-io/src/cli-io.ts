import { bold, FormattedTable, indentLines, LogWriter } from "@takomo/util"
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
  readonly transform?: (msg: string) => string
}

interface TableProps {
  readonly table: FormattedTable
  readonly marginTop?: boolean
  readonly marginBottom?: boolean
  readonly showHeaders?: boolean
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
    lines: ReadonlyArray<string>,
    marginTop: boolean,
    marginBottom: boolean,
    indent: number,
  ) => void
  table: (props: TableProps) => void
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
    table: ({
      table,
      marginBottom,
      marginTop,
      showHeaders,
      indent,
    }: TableProps) => {
      if (marginTop) {
        print()
      }

      table.print({
        indent,
        showHeaders,
        writer: print,
      })

      if (marginBottom) {
        print()
      }
    },
  }
}
