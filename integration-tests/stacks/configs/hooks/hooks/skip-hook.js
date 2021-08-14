module.exports = {
  type: "skip",
  init: (props) => {
    console.log("Initialize skip-hook")
    return {
      execute: (input) => {
        console.log("Execute skip-hook!")
        console.log(`Stage:     ${input.stage}`)
        console.log(`Operation: ${input.operation}`)
        console.log(`Status:    ${input.status}`)
        console.log(JSON.stringify(props, undefined, 2))
        return {
          success: true,
          message: "Skip requested",
          value: "skip",
          skip: true,
        }
      },
    }
  },
}
