/**
 * @hidden
 */
export const prettyPrintJson = (json: string): string =>
  JSON.stringify(JSON.parse(json), null, 2)

/**
 * @hidden
 */
export const compactJson = (json: string): string =>
  JSON.stringify(JSON.parse(json))
