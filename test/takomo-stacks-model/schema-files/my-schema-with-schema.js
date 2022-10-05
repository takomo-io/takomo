module.exports = {
  name: "my-schema-with-schema",
  init: ({ joi }) => {
    return joi.string()
  },
  schema: ({ joi, base }) => {
    return base
  },
}
