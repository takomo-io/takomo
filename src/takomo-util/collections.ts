import R from "ramda"

interface CollectFromHierarchyProps<T> {
  readonly sortSiblings?: (a: T, b: T) => number
  readonly filter?: (node: T) => boolean
}

/**
 * @hidden
 */
export const collectFromHierarchy = <T>(
  root: T,
  extractChildren: (node: T) => ReadonlyArray<T>,
  props?: CollectFromHierarchyProps<T>,
): ReadonlyArray<T> => {
  const filter = props?.filter || (() => true)
  if (!filter(root)) {
    return []
  }

  const children = extractChildren(root).filter(filter)
  const sortedChildren = props?.sortSiblings
    ? children.slice().sort(props?.sortSiblings)
    : children

  return sortedChildren.reduce(
    (collected, child) => {
      const values = collectFromHierarchy(child, extractChildren, props)
      return [...collected, ...values]
    },
    [root],
  )
}

/**
 * @hidden
 */
export const mapToObject = (
  map: Map<string, unknown>,
): Record<string, unknown> =>
  Array.from(map.entries()).reduce(
    (collected, [key, value]) => ({ ...collected, [key]: value }),
    {},
  )

/**
 * @hidden
 */
export const arrayToObject = <T extends object>(
  array: ReadonlyArray<T>,
  keyExtractor: (item: T) => string,
  valueExtractor: (item: T) => unknown = R.identity,
): Record<string, unknown> =>
  array.reduce(
    (collected, item) => ({
      ...collected,
      [keyExtractor(item)]: valueExtractor(item),
    }),
    {},
  )

/**
 * @hidden
 */
export const arrayToMap = <T>(
  items: ReadonlyArray<T>,
  keyExtractor: (item: T) => string,
): Map<string, T> => new Map(items.map((item) => [keyExtractor(item), item]))

/**
 * @hidden
 */
export const findNonUniques = <Primitive>(
  items: ReadonlyArray<Primitive>,
): ReadonlyArray<Primitive> =>
  R.uniq(
    items.filter((item) => items.filter((i) => i === item).length > 1),
  ).sort()

interface MergeArraysProps<T> {
  readonly first: ReadonlyArray<T>
  readonly second: ReadonlyArray<T>
  readonly equals?: (a: T, b: T) => boolean
  readonly allowDuplicates?: boolean
}

/**
 * @hidden
 */
export const mergeArrays = <T>({
  first,
  second,
  equals = R.equals,
  allowDuplicates = false,
}: MergeArraysProps<T>): ReadonlyArray<T> => {
  const merged = [...first, ...second]
  if (allowDuplicates) {
    return merged
  }

  return merged.reduce((collected, current) => {
    const eq = (a: T) => equals(a, current)
    if (collected.some(eq)) {
      return collected
    }

    const lastDuplicate = R.findLast(eq, merged)
    if (!lastDuplicate) {
      throw new Error("Expected an item to be found")
    }

    return [...collected, lastDuplicate]
  }, new Array<T>())
}

/**
 * @hidden
 */
export const mergeMaps = <T>(
  ...maps: ReadonlyArray<Map<string, T>>
): Map<string, T> =>
  new Map(
    maps.reduce(
      (collected, map) => [...collected, ...map],
      new Array<[string, T]>(),
    ),
  )
