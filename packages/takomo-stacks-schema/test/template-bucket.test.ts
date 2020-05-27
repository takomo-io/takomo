import { templateBucket } from "../src"

describe("templateBucket validation succeeds", () => {
  test("when only name is given", () => {
    const { error } = templateBucket.validate({
      name: "bucketName",
    })
    expect(error).toBeUndefined()
  })

  test("when name and keyPrefix are given", () => {
    const { error } = templateBucket.validate({
      name: "bucket",
      keyPrefix: "templates/",
    })
    expect(error).toBeUndefined()
  })
})

describe("template bucket validation fails", () => {
  test("when an empty object is given", () => {
    const { error } = templateBucket.validate({})
    expect(error.message).toBe('"name" is required')
  })

  test("when only keyPrefix is given", () => {
    const { error } = templateBucket.validate({ keyPrefix: "prefix/" })
    expect(error.message).toBe('"name" is required')
  })
})
