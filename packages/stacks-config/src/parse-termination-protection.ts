export const parseTerminationProtection = (value: unknown): boolean | null => {
  if (value === null || value === undefined) {
    return null
  }

  return value === true
}
