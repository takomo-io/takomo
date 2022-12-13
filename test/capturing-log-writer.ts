import { LogWriter } from "../src/utils/logging"

interface LogOutput {
  value: string
}

export const createCapturingLogWriter = (output: LogOutput): LogWriter => {
  return (message?: unknown, ...optionalParams: unknown[]) => {
    if (message) {
      output.value += message + "\n"
    } else {
      output.value += "\n"
    }
    console.log(message, ...optionalParams)
  }
}
