import stringify from "json-stable-stringify"

/**
 * @hidden
 */
export const prettyPrintJson = (json: string): string =>
  stringify(JSON.parse(json), { space: 2 })

/**
 * @hidden
 */
export const toPrettyJson = (obj: unknown): string =>
  stringify(obj, { space: 2 })

/**
 * @hidden
 */
export const compactJson = (json: string): string => stringify(JSON.parse(json))
