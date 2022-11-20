import { mergeArrays } from "../../../src/utils/collections"

describe("#mergeArrays", () => {
  test("two empty arrays", () => {
    const first = new Array<string>()
    const second = new Array<string>()
    const actual = mergeArrays({ first, second, allowDuplicates: true })
    const expected = new Array<string>()
    expect(actual).toStrictEqual(expected)
  })

  test("first is empty, second has items", () => {
    const first = new Array<string>()
    const second = ["a", "b"]
    const actual = mergeArrays({ first, second, allowDuplicates: true })
    const expected = ["a", "b"]
    expect(actual).toStrictEqual(expected)
  })

  test("first is empty, second has duplicate items", () => {
    const first = new Array<string>()
    const second = ["a", "b", "a"]
    const actual = mergeArrays({ first, second, allowDuplicates: true })
    const expected = ["a", "b", "a"]
    expect(actual).toStrictEqual(expected)
  })

  test("first has duplicate items, second is empty", () => {
    const first = ["a", "b", "b"]
    const second = new Array<string>()
    const actual = mergeArrays({ first, second, allowDuplicates: true })
    const expected = ["a", "b", "b"]
    expect(actual).toStrictEqual(expected)
  })

  test("first is empty, second has duplicate items, no duplicates allowed", () => {
    const first = new Array<string>()
    const second = ["a", "b", "a"]
    const actual = mergeArrays({ first, second, allowDuplicates: false })
    const expected = ["a", "b"]
    expect(actual).toStrictEqual(expected)
  })

  test("first has duplicate items, second is empty, no duplicates allowed", () => {
    const first = ["a", "b", "b"]
    const second = new Array<string>()
    const actual = mergeArrays({ first, second, allowDuplicates: false })
    const expected = ["a", "b"]
    expect(actual).toStrictEqual(expected)
  })

  test("both have items, no duplicates", () => {
    const first = ["a", "b"]
    const second = ["c"]
    const actual = mergeArrays({ first, second, allowDuplicates: true })
    const expected = ["a", "b", "c"]
    expect(actual).toStrictEqual(expected)
  })

  test("both have items, with duplicates", () => {
    const first = ["a", "c", "b"]
    const second = ["c"]
    const actual = mergeArrays({ first, second, allowDuplicates: true })
    const expected = ["a", "c", "b", "c"]
    expect(actual).toStrictEqual(expected)
  })

  test("both have items, no duplicates and no duplicates allowed", () => {
    const first = ["a", "b"]
    const second = ["c"]
    const actual = mergeArrays({ first, second, allowDuplicates: false })
    const expected = ["a", "b", "c"]
    expect(actual).toStrictEqual(expected)
  })

  test("both have items, with duplicates and no duplicates allowed", () => {
    const first = ["a", "c", "b"]
    const second = ["c"]
    const actual = mergeArrays({ first, second, allowDuplicates: false })
    const expected = ["a", "c", "b"]
    expect(actual).toStrictEqual(expected)
  })

  test("both have items, with more duplicates and no duplicates allowed", () => {
    const first = ["a", "c", "b", "b"]
    const second = ["c", "a", "a", "b"]
    const actual = mergeArrays({ first, second, allowDuplicates: false })
    const expected = ["a", "c", "b"]
    expect(actual).toStrictEqual(expected)
  })

  test("both have items, with duplicates and no duplicates allowed", () => {
    const first = ["a", "c", "b"]
    const second = ["c"]
    const actual = mergeArrays({ first, second, allowDuplicates: false })
    const expected = ["a", "c", "b"]
    expect(actual).toStrictEqual(expected)
  })

  test("complex items, both have items, with more duplicates and no duplicates allowed", () => {
    const first = [
      { name: "a", code: "1" },
      { name: "c", code: "1" },
      { name: "b", code: "1" },
      { name: "b", code: "2" },
    ]
    const second = [
      { name: "c", code: "2" },
      { name: "a", code: "2" },
      { name: "a", code: "3" },
      { name: "b", code: "3" },
    ]
    const actual = mergeArrays({
      first,
      second,
      allowDuplicates: false,
      equals: (a, b) => a.name === b.name,
    })
    const expected = [
      { name: "a", code: "3" },
      { name: "c", code: "2" },
      { name: "b", code: "3" },
    ]
    expect(actual).toStrictEqual(expected)
  })
})
