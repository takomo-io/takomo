module.exports = {
  type: "one",
  init: () => {
    return {
      execute: ({ currentStack }) => {
        return {
          success: true,
          message: "Ok",
          value: currentStack ? currentStack.name : "undefined",
        }
      },
    }
  },
}
