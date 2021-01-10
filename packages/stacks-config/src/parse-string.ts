export const parseString = (value: unknown): string | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === "string") {
    return value
  }

  throw new Error("Expected string")
}
