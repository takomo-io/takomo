export default {
  name: "MyParams",
  init: ({ joi }) =>
    joi.object({
      Environment: joi.string().valid("dev", "test", "prod").required(),
      CostCenter: joi.string().alphanum(),
    }),
}
