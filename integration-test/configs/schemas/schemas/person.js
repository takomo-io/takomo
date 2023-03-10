export default {
  name: "person",
  init: ({ joi, props }) =>
    joi
      .object({
        name: joi.string().required(),
        age: joi.number().max(props.maxAge).required(),
      })
      .unknown(true),
}
