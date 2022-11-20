import stringify from "json-stable-stringify"

export const prettyPrintJson = (json: string): string =>
  stringify(JSON.parse(json), { space: 2 })

export const toPrettyJson = (obj: unknown): string =>
  stringify(obj, { space: 2 })

export const toCompactJson = (json: unknown): string => stringify(json)
