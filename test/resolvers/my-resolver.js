module.exports = {
  name: "my-cool-resolver",
  init: (props) => {
    return {
      resolve: () => props.greeting.toUpperCase(),
    }
  },
  schema: ({ joi, base }) => {
    return base.keys({
      greeting: joi.string().max(10),
    })
  },
}
