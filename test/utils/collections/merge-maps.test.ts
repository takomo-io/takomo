import { mergeMaps } from "../../../src/utils/collections.js"

describe("#mergeMaps", () => {
  test("single empty maps", () => {
    expect(mergeMaps(new Map())).toStrictEqual(new Map())
  })
  test("empty maps", () => {
    expect(mergeMaps(new Map(), new Map())).toStrictEqual(new Map())
  })
  test("first empty and second non-empty", () => {
    const a = new Map([["a", 1]])
    const b = new Map()
    const expected = new Map([["a", 1]])
    expect(mergeMaps(a, b)).toStrictEqual(expected)
  })
  test("first non-empty and second empty", () => {
    const a = new Map()
    const b = new Map([["a", 1]])
    const expected = new Map([["a", 1]])
    expect(mergeMaps(a, b)).toStrictEqual(expected)
  })
  test("two non-empty with unique keys", () => {
    const a = new Map([["a", 1]])
    const b = new Map([["b", 2]])
    const expected = new Map([
      ["a", 1],
      ["b", 2],
    ])
    expect(mergeMaps(a, b)).toStrictEqual(expected)
  })
  test("two non-empty with multiple unique keys", () => {
    const a = new Map([
      ["a", 1],
      ["c", 3],
    ])
    const b = new Map([
      ["b", 2],
      ["d", 4],
    ])
    const expected = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
      ["d", 4],
    ])
    expect(mergeMaps(a, b)).toStrictEqual(expected)
  })
  test("two non-empty with non-unique keys", () => {
    const a = new Map([["a", 1]])
    const b = new Map([["a", 2]])
    const expected = new Map([["a", 2]])
    expect(mergeMaps(a, b)).toStrictEqual(expected)
  })
  test("two non-empty with multiple unique and non-unique keys", () => {
    const a = new Map([
      ["a", 1],
      ["c", 3],
    ])
    const b = new Map([
      ["b", 2],
      ["d", 4],
      ["a", 10],
      ["c", 20],
    ])
    const expected = new Map([
      ["a", 10],
      ["b", 2],
      ["c", 20],
      ["d", 4],
    ])
    expect(mergeMaps(a, b)).toStrictEqual(expected)
  })
  test("three non-empty with multiple unique and non-unique keys", () => {
    const a = new Map([
      ["a", 1],
      ["c", 3],
    ])
    const b = new Map([
      ["b", 2],
      ["d", 4],
      ["a", 10],
      ["c", 20],
    ])
    const c = new Map([
      ["e", 8],
      ["c", 444],
    ])
    const expected = new Map([
      ["a", 10],
      ["b", 2],
      ["c", 444],
      ["d", 4],
      ["e", 8],
    ])
    expect(mergeMaps(a, b, c)).toStrictEqual(expected)
  })
})
