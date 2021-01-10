/**
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const deepFreezeNode = require("deep-freeze-node")

/**
 * @hidden
 */
export const deepCopy = (obj: any): any => JSON.parse(JSON.stringify(obj))

/**
 * @hidden
 */
export const identity = <T>(value: T): T => value

/**
 * @hidden
 */
export const deepFreeze = <T>(obj: T): T => deepFreezeNode(obj)
