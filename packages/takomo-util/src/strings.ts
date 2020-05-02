import crypto from "crypto"

export const indentLines = (string: string, indent = 2): string => {
  const padding = " ".repeat(indent)
  return string
    .split("\n")
    .map((line) => `${padding}${line}`)
    .join("\n")
}

export const checksum = (string: string): string =>
  crypto.createHash("sha256").update(string, "utf8").digest("hex")

export const getStringSizeInBytes = (string: string): number =>
  Buffer.byteLength(string, "utf8")
