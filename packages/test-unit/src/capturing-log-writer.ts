export class CapturingLogWriter {
  output = ""

  write = (message?: any, ...optionalParams: any[]): void => {
    if (message) {
      this.output += message + "\n"
    } else {
      this.output += "\n"
    }
    console.log(message, ...optionalParams)
  }
}
