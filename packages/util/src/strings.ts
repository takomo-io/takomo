import crypto from "crypto"

/**
 * @hidden
 */
export const indentLines = (string: string, indent = 2): string => {
  const padding = " ".repeat(indent)
  return string
    .split("\n")
    .map((line) => `${padding}${line}`)
    .join("\n")
}

/**
 * @hidden
 */
export const checksum = (string: string): string =>
  crypto.createHash("sha256").update(string, "utf8").digest("hex")

/**
 * @hidden
 */
export const getStringSizeInBytes = (string: string): number =>
  Buffer.byteLength(string, "utf8")
