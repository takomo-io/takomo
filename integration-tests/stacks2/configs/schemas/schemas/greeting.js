module.exports = {
  name: "greeting",
  init: ({ joi }) =>
    joi
      .object({
        greeting: joi.string().max(5).required(),
      })
      .unknown(true),
}
