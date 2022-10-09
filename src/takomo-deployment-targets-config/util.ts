export const fillMissingDeploymentGroups = (
  value: Record<string, unknown>,
): Record<string, unknown> => {
  for (const key of Object.keys(value)) {
    const parts = key.split("/")
    for (let i = 1; i <= parts.length; i++) {
      const subKey = parts.slice(0, i).join("/")
      if (!(subKey in value)) {
        value[subKey] = {}
      }
    }
  }

  return value
}
