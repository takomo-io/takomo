module.exports = {
  name: "invalid-schema-return-type",
  init: ({ joi }) => {
    return joi.string()
  },
  schema: () => {
    return "invalid"
  },
}
