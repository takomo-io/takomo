import _merge from "lodash.merge"

export const deepCopy = (obj: any): any => JSON.parse(JSON.stringify(obj))

export const identity = <T>(value: T): T => value

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
