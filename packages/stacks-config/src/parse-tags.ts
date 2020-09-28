export const parseTags = (value: any): Map<string, string> => {
  if (value === null || value === undefined) {
    return new Map()
  }

  return new Map(
    Object.entries(value).map((e) => {
      const [k, v] = e
      return [k, `${v}`]
    }),
  )
}
