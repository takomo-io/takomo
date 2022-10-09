module.exports = {
  name: () => "my-schema-f",
  init: ({ joi }) => {
    return joi.string()
  },
}
