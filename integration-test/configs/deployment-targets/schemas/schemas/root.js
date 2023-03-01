export default {
  name: "root",
  init: ({ joi }) =>
    joi.object().pattern(
      /^/,
      joi
        .object({
          vars: joi
            .object({
              owner: joi.string().required(),
              "cost-center": joi.number().required(),
              logGroupName: joi.string().required(),
            })
            .required()
            .unknown(true),
        })
        .unknown(true),
    ),
}
