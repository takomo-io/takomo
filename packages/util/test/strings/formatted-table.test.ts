import { table } from "../../src"

describe("FormattedTable#print", () => {
  test("show headers", () => {
    let output = ""
    const writer = (str = "") => {
      output += `${str}\n`
    }
    table({
      headers: ["first", "second", "very long header"],
    })
      .row(1, 2, 3)
      .row(4, 5, 6)
      .print({ writer })
    expect(output).toStrictEqual(
      "first  second  very long header\n" +
        "-----  ------  ----------------\n" +
        "1      2       3               \n" +
        "4      5       6               \n",
    )
  })

  test("hide headers", () => {
    let output = ""
    const writer = (str = "") => {
      output += `${str}\n`
    }
    table({
      headers: ["first", "second", "very long header"],
    })
      .row(1, 2, 3)
      .row(4, 5, 6)
      .print({ writer, showHeaders: false })
    expect(output).toStrictEqual("1  2  3\n" + "4  5  6\n")
  })

  test("show headers with indent", () => {
    let output = ""
    const writer = (str = "") => {
      output += `${str}\n`
    }
    table({
      headers: ["first", "second", "very long header"],
    })
      .row(1, 2, 3)
      .row(4, 5, 6)
      .print({ writer, indent: 2 })
    expect(output).toStrictEqual(
      "  first  second  very long header\n" +
        "  -----  ------  ----------------\n" +
        "  1      2       3               \n" +
        "  4      5       6               \n",
    )
  })
})
