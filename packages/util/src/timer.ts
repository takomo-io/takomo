import Table from "easy-table"
import prettyMs from "pretty-ms"

/**
 * @hidden
 */
export interface Timer {
  readonly name: string
  readonly startTime: number
  readonly startChild: (name: string) => Timer
  readonly stop: (stopTime?: number) => void
  readonly getSecondsElapsed: () => number
  readonly withChildren: (visitor: (child: Timer) => void) => void
}

/**
 * @hidden
 */
export const createTimer = (name: string): Timer => {
  const children: Timer[] = []
  const startTime = Date.now()

  let stopTime: number | undefined = undefined

  const startChild = (name: string): Timer => {
    const child = createTimer(name)
    children.push(child)
    return child
  }

  const stop = (time: number = Date.now()): void => {
    if (!stopTime) {
      stopTime = time || Date.now()
    }

    children.forEach((child) => child.stop(stopTime))
  }

  const getSecondsElapsed = (): number =>
    stopTime ? stopTime - startTime : Date.now() - startTime

  const withChildren = (visitor: (child: Timer) => void): void => {
    children.forEach(visitor)
  }

  return {
    name,
    startChild,
    startTime,
    stop,
    getSecondsElapsed,
    withChildren,
  }
}

const collectTimerItems = (timer: Timer, table: Table, depth: number): void => {
  const padding = " ".repeat(depth * 2)
  table.cell("Name", `${padding}${timer.name}`)
  table.cell("Time", prettyMs(timer.getSecondsElapsed()))
  table.newRow()
  timer.withChildren((child) => {
    collectTimerItems(child, table, depth + 1)
  })
}

/**
 * @hidden
 */
export const printTimer = (timer: Timer): string => {
  const table = new Table()
  collectTimerItems(timer, table, 0)
  return table.toString()
}
