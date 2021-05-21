import { parseTemplate } from "../dist/parse-template"

describe("#parseTemplate", () => {
  test("simple file name", () => {
    const actual = parseTemplate("vpc.yml")
    expect(actual).toStrictEqual({
      filename: "vpc.yml",
      dynamic: true,
      inline: undefined,
    })
  })
  test("file name with object notation", () => {
    const actual = parseTemplate({ filename: "rds.yml" })
    expect(actual).toStrictEqual({
      filename: "rds.yml",
      dynamic: true,
      inline: undefined,
    })
  })
  test("file name with object notation and dynamic true", () => {
    const actual = parseTemplate({ filename: "rds2.yml", dynamic: true })
    expect(actual).toStrictEqual({
      filename: "rds2.yml",
      dynamic: true,
      inline: undefined,
    })
  })
  test("file name with object notation and dynamic false", () => {
    const actual = parseTemplate({ filename: "esb.yml", dynamic: false })
    expect(actual).toStrictEqual({
      filename: "esb.yml",
      dynamic: false,
      inline: undefined,
    })
  })
  test("inline with object notation", () => {
    const actual = parseTemplate({ inline: "xxxxxx" })
    expect(actual).toStrictEqual({
      inline: "xxxxxx",
      dynamic: true,
      filename: undefined,
    })
  })
  test("inline with object notation and dynamic true", () => {
    const actual = parseTemplate({ inline: "aaaa", dynamic: true })
    expect(actual).toStrictEqual({
      inline: "aaaa",
      dynamic: true,
      filename: undefined,
    })
  })
  test("inline with object notation and dynamic false", () => {
    const actual = parseTemplate({ inline: "aaaa", dynamic: false })
    expect(actual).toStrictEqual({
      inline: "aaaa",
      dynamic: false,
      filename: undefined,
    })
  })
})
