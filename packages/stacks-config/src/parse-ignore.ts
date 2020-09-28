export const parseIgnore = (value: unknown): boolean | null => {
  if (value === null || value === undefined) {
    return null
  }

  return value === true
}
