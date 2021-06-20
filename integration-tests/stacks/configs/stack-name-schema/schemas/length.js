module.exports = {
  name: "length",
  init: ({ joi }) => joi.string().max(10),
}
