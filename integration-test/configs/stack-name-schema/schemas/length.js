export default {
  name: "length",
  init: ({ joi }) => joi.string().max(10),
}
