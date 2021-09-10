import _merge from "lodash.merge"

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

/**
 * @hidden
 */
export const merge = (...objects: any[]): any => {
  const [first, second, ...rest] = objects
  if (!first) {
    throw new Error("Expected at least one parameter")
  }

  if (!second) {
    return first
  }

  const target = deepCopy(first)
  _merge(target, second)

  if (rest.length === 0) {
    return target
  }

  return merge(target, ...rest)
}
