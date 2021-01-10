export const parseTerminationProtection = (
  value: unknown,
): boolean | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  return value === true
}
