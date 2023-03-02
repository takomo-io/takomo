import { createStacksSchemas } from "../../../src/schema/stacks-schema.js"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "../../assertions.js"

const { templateBucket } = createStacksSchemas({
  regions: [],
})

describe("templateBucket validation succeeds", () => {
  test("when only name is given", () => {
    expectNoValidationError(templateBucket)({
      name: "bucketName",
    })
  })

  test("when name and keyPrefix are given", () => {
    expectNoValidationError(templateBucket)({
      name: "bucket",
      keyPrefix: "templates/",
    })
  })
})

describe("template bucket validation fails", () => {
  test("when an empty object is given", () => {
    expectValidationErrors(templateBucket)({}, '"name" is required')
  })

  test("when only keyPrefix is given", () => {
    expectValidationErrors(templateBucket)(
      { keyPrefix: "prefix/" },
      '"name" is required',
    )
  })
})
