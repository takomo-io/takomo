export default {
  name: "invalid-resolver-bad-schema",
  init: (props) => {
    return {
      resolve: () => true,
    }
  },
  schema: true,
}
