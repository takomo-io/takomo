export const parseStringArray = (value: any): ReadonlyArray<string> => {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}
