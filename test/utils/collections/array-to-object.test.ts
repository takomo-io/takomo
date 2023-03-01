import * as R from "ramda"
import { arrayToObject } from "../../../src/utils/collections.js"

describe("#mapToObject", () => {
  describe("returns correct value when", () => {
    test.concurrent("an empty array is given", async () => {
      expect(arrayToObject([], R.identity)).toStrictEqual({})
    })
    test.concurrent("an array with single value is given", async () => {
      expect(
        arrayToObject([{ name: "John" }], (item) => item.name),
      ).toStrictEqual({
        John: { name: "John" },
      })
    })
    test.concurrent("an array with multiple values is given", async () => {
      expect(
        arrayToObject(
          [
            { age: 12, code: "se" },
            { age: 22, code: "fi" },
          ],
          (item) => item.code,
        ),
      ).toStrictEqual({
        se: { age: 12, code: "se" },
        fi: { age: 22, code: "fi" },
      })
    })
    test.concurrent(
      "an array with multiple values is given with value extractor",
      async () => {
        expect(
          arrayToObject(
            [
              { age: 12, code: "se" },
              { age: 22, code: "fi" },
            ],
            (item) => item.code,
            (item) => item.age,
          ),
        ).toStrictEqual({
          se: 12,
          fi: 22,
        })
      },
    )
  })
})
