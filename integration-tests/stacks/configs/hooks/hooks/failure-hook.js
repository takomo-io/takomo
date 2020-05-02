module.exports = {
  type: "failure",
  init: props => {
    console.log("Initialize failure-hook")
    return {
      execute: input => {
        console.log("Execute failure-hook!")
        console.log(`Stage:     ${input.stage}`)
        console.log(`Operation: ${input.operation}`)
        console.log(`Status:    ${input.status}`)
        console.log(JSON.stringify(props, null, 2))
        return {
          success: false,
          message: "Not ok",
          value: false,
        }
      },
    }
  },
}
