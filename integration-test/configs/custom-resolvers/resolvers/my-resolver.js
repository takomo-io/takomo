module.exports = {
  name: "my-custom-resolver",
  init: (props) => ({
    resolve: () => {
      return props.value
    },
  }),
}
