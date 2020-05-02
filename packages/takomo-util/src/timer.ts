import Table from "easy-table"
import prettyMs from "pretty-ms"

export class StopWatch {
  readonly name: string
  readonly startTime: number
  readonly children: StopWatch[] = []
  stopTime = 0

  constructor(name: string) {
    this.name = name
    this.startTime = Date.now()
  }

  startChild = (name: string): StopWatch => {
    const child = new StopWatch(name)
    this.children.push(child)
    return child
  }

  stop = (stopTime?: number): StopWatch => {
    if (this.stopTime === 0) {
      this.stopTime = stopTime || Date.now()
    }

    this.children.forEach((child) => child.stop(stopTime))
    return this
  }

  get secondsElapsed(): number {
    return this.stopTime === 0
      ? Date.now() - this.startTime
      : this.stopTime - this.startTime
  }
}

const collectStopWatchItems = (
  watch: StopWatch,
  table: Table,
  depth: number,
): void => {
  const padding = " ".repeat(depth * 2)
  table.cell("Name", `${padding}${watch.name}`)
  table.cell("Time", prettyMs(watch.secondsElapsed))
  table.newRow()

  watch.children.forEach((c) => collectStopWatchItems(c, table, depth + 1))
}

export const printStopWatch = (watch: StopWatch): string => {
  const table = new Table()
  collectStopWatchItems(watch, table, 0)
  return table.toString()
}
