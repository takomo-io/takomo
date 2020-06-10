import semver from "semver"

export const versionSatisfies = (
  version: string,
  requiredVersion: string,
): boolean => semver.satisfies(version, requiredVersion)
