export default {
  name: "my-custom-resolver",
  init: (props) => ({
    resolve: () => {
      return props.value
    },
  }),
}
