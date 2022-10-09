import { splitTextInLines } from "../../../src/takomo-util"

describe("#splitTextInLines", () => {
  test("empty string", () => {
    const result = splitTextInLines(10, "")
    expect(result).toStrictEqual([""])
  })

  test("single word whose length is less than the line width", () => {
    const result = splitTextInLines(10, "word")
    expect(result).toStrictEqual(["word"])
  })

  test("line whose content length is more than the line width", () => {
    const result = splitTextInLines(10, "this has more text")
    expect(result).toStrictEqual(["this has", "more text"])
  })

  test("multiple lines", () => {
    const result = splitTextInLines(
      10,
      "one two three four five six seven eight nine ten",
    )
    expect(result).toStrictEqual([
      "one two",
      "three four",
      "five six",
      "seven",
      "eight nine",
      "ten",
    ])
  })

  test("lines with a word longer than the line width", () => {
    const result = splitTextInLines(10, "this has more thisistheextralongword")
    expect(result).toStrictEqual(["this has", "more", "thisistheextralongword"])
  })
})
