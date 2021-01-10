export const parseIgnore = (value: unknown): boolean | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  return value === true
}
