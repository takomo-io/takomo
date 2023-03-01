const init = ({ joi }) => {
  return joi.object({
    first: joi.string(),
    second: joi.number(),
    third: joi.boolean(),
    fourth: joi.boolean(),
    fifth: joi.number(),
    sixth: joi.string(),
    seventh: joi.string(),
  })
}

export default {
  name: "common-tags",
  init,
}
