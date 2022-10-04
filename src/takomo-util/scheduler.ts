import PQueue from "p-queue"
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const PQueue = require("p-queue")
import { TkmLogger } from "./logging"
import { randomInt } from "./random"
import { sleep } from "./system"
import { formatElapsedMillis } from "./timer"

interface ExecuteProps<T> {
  readonly fn: () => Promise<T>
  readonly taskId: string
}

export interface Scheduler {
  readonly execute: <T>(props: ExecuteProps<T>) => Promise<T>
}

export interface CreateSchedulerProps {
  readonly concurrency: number
  readonly intervalInMillis: number
  readonly intervalCap: number
  readonly logger: TkmLogger
  readonly id: string
}

export const createScheduler = ({
  concurrency,
  intervalInMillis,
  intervalCap,
  logger,
  id,
}: CreateSchedulerProps): Scheduler => {
  const queue = new PQueue({
    concurrency,
    intervalCap,
    interval: intervalInMillis,
    carryoverConcurrencyCount: true,
  })

  queue.on("active", () => {
    logger.debug(
      `Executor ${id}, size: ${queue.size}, pending: ${queue.pending}`,
    )
  })

  const execute = <T>({ fn, taskId }: ExecuteProps<T>): Promise<T> => {
    logger.debug(`Put task ${taskId} in queue`)
    const startTime = Date.now()
    const wrapped = async () => {
      logger.debug(
        `Execute task ${taskId} after wait of ${formatElapsedMillis(
          Date.now() - startTime,
        )}`,
      )
      await sleep(randomInt(5, 50))
      return fn()
    }

    return queue.add(wrapped)
  }

  return {
    execute,
  }
}
