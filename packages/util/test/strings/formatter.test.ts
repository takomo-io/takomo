import { formatter } from "../../src/strings"

interface Person {
  readonly id: number
  readonly name: string
}

const items = [
  { id: 1, name: "John" },
  { id: 2, name: "James Bond" },
  { id: 3, name: "Spiderman" },
  { id: 4, name: undefined },
]

describe("formatter", () => {
  test("default settings", () => {
    const idFormatter = formatter({ items, getter: (item) => item.id })
    expect(items.map(idFormatter)).toStrictEqual(["1", "2", "3", "4"])
  })

  test("padding left", () => {
    const nameFormatter = formatter({
      items,
      getter: (item) => item.name,
      padding: "left",
    })
    expect(items.map(nameFormatter)).toStrictEqual([
      "      John",
      "James Bond",
      " Spiderman",
      " undefined",
    ])
  })

  test("padding right", () => {
    const nameFormatter = formatter({
      items,
      getter: (item) => item.name,
      padding: "right",
    })
    expect(items.map(nameFormatter)).toStrictEqual([
      "John      ",
      "James Bond",
      "Spiderman ",
      "undefined ",
    ])
  })

  test("padding right and margin right", () => {
    const nameFormatter = formatter({
      items,
      getter: (item) => item.name,
      padding: "right",
      marginRight: 2,
    })
    expect(items.map(nameFormatter)).toStrictEqual([
      "John        ",
      "James Bond  ",
      "Spiderman   ",
      "undefined   ",
    ])
  })

  test("margin left", () => {
    const nameFormatter = formatter({
      items,
      getter: (item) => item.name,
      marginLeft: 5,
    })
    expect(items.map(nameFormatter)).toStrictEqual([
      "     John",
      "     James Bond",
      "     Spiderman",
      "     undefined",
    ])
  })

  test("margin right", () => {
    const nameFormatter = formatter({
      items,
      getter: (item) => item.name,
      marginRight: 3,
    })
    expect(items.map(nameFormatter)).toStrictEqual([
      "John   ",
      "James Bond   ",
      "Spiderman   ",
      "undefined   ",
    ])
  })
})
