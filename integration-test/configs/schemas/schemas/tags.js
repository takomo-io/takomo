module.exports = {
  name: "myTags",
  init: ({ joi }) =>
    joi
      .object({
        environment: joi.string().min(2).required(),
        costCenter: joi.string().max(4).required(),
      })
      .unknown(false),
}
