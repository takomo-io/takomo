module.exports = {
  name: "maxLength",
  init: ({ joi, props }) => {
    return joi.string().max(props.max)
  },
  schema: ({ joi, base }) => {
    return base.keys({ max: joi.number().max(20) })
  },
}
