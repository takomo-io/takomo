module.exports = {
  name: "email",
  init: ({ joi }) => {
    return joi.string().email()
  },
}
