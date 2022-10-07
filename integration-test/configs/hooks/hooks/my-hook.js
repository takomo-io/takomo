module.exports = {
  type: "my-hook",
  init: (props) => {
    console.log("Initialize my-hook")
    return {
      execute: (input) => {
        console.log("Execute my-hook!")
        console.log(`Stage:     ${input.stage}`)
        console.log(`Operation: ${input.operation}`)
        console.log(`Status:    ${input.status}`)
        console.log(JSON.stringify(props, null, 2))
        return {
          success: true,
          message: "Ok",
          value: "Success",
        }
      },
    }
  },
}
