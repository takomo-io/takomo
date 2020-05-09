module.exports = {
  name: "my-timestamper",
  init: (props) => {
    return {
      resolve: () => {
        return Date.now()
      },
    }
  },
}
