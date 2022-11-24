import Table from "easy-table"
import prettyMs from "pretty-ms"

export const formatElapsedMillis = (milliseconds: number): string =>
  prettyMs(milliseconds)

export class Timer {
  readonly name: string

  #startTime = Date.now()
  #stopTime: number | undefined = undefined
  #children: Timer[] = []

  constructor(name: string) {
    this.name = name
  }

  startChild(name: string): Timer {
    const child = new Timer(name)
    this.#children.push(child)
    return child
  }

  stop(time: number = Date.now()): Timer {
    if (!this.#stopTime) {
      this.#stopTime = time || Date.now()
    }

    this.#children.forEach((child) => child.stop(this.#stopTime))
    return this
  }

  getTimeElapsed(): number {
    return this.#stopTime
      ? this.#stopTime - this.#startTime
      : Date.now() - this.#startTime
  }

  withChildren(visitor: (child: Timer) => void): void {
    this.#children.forEach(visitor)
  }

  getFormattedTimeElapsed(): string {
    return prettyMs(this.getTimeElapsed())
  }
}

const collectTimerItems = (timer: Timer, table: Table, depth: number): void => {
  const padding = " ".repeat(depth * 2)
  table.cell("Name", `${padding}${timer.name}`)
  table.cell("Time", prettyMs(timer.getTimeElapsed()))
  table.newRow()
  timer.withChildren((child) => {
    collectTimerItems(child, table, depth + 1)
  })
}

export const printTimer = (timer: Timer): string => {
  const table = new Table()
  collectTimerItems(timer, table, 0)
  return table.toString()
}
