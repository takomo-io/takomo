export default {
  name: "email",
  init: ({ joi }) => {
    return joi.string().email()
  },
}
