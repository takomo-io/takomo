module.exports = {
  name: "invalid-resolver-bad-validator",
  init: (props) => {
    return {
      resolve: () => true
    }
  },
  validate: true 
}