export default {
  name: "invalid-resolver-bad-schema2",
  init: (props) => {
    return {
      resolve: () => true,
    }
  },
  schema: () => "no good",
}
