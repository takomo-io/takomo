import {
  createStack,
  InternalStack,
  StackPath,
  StackProps,
} from "@takomo/stacks-model"
import { TakomoError } from "@takomo/util"
import flatten from "lodash.flatten"
import uniq from "lodash.uniq"

/**
 * @hidden
 */
export const checkCyclicDependenciesForStack = (
  stack: InternalStack,
  stacks: Map<StackPath, InternalStack>,
  collectedDependencies: ReadonlyArray<StackPath>,
): void => {
  if (stack.dependencies.length === 0) {
    return
  }

  stack.dependencies.forEach((d) => {
    if (collectedDependencies.includes(d)) {
      throw new TakomoError(
        `Cyclic dependency detected: ${collectedDependencies.join(
          " -> ",
        )} -> ${d}`,
      )
    }

    checkCyclicDependenciesForStack(stacks.get(d)!, stacks, [
      ...collectedDependencies,
      d,
    ])
  })
}

/**
 * @hidden
 */
export const checkCyclicDependencies = (
  stacks: Map<StackPath, InternalStack>,
) => {
  stacks.forEach((s) => checkCyclicDependenciesForStack(s, stacks, [s.path]))
}

/**
 * @hidden
 */
export const collectAllDependencies = (
  stackPath: StackPath,
  stacks: InternalStack[],
): StackPath[] => {
  const stack = stacks.find((s) => s.path === stackPath)!
  return uniq(
    stack.dependencies.reduce((collected, dependencyPath) => {
      const childDependencies = collectAllDependencies(dependencyPath, stacks)
      return [...collected, ...childDependencies, dependencyPath]
    }, new Array<StackPath>()),
  )
}

/**
 * @hidden
 */
export const collectAllDependants = (
  stackPath: StackPath,
  stacks: InternalStack[],
): StackPath[] => {
  const stack = stacks.find((s) => s.path === stackPath)!
  return uniq(
    stack.dependants.reduce((collected, dependantPath) => {
      const childDependants = collectAllDependants(dependantPath, stacks)
      return [...collected, ...childDependants, dependantPath]
    }, new Array<StackPath>()),
  )
}

/**
 * @hidden
 */
export const collectStackDirectDependants = (
  stackPath: StackPath,
  stacks: StackProps[],
): string[] =>
  stacks
    .filter((s) => s.path !== stackPath)
    .reduce((dependants, s) => {
      return s.dependencies.includes(stackPath)
        ? [...dependants, s.path]
        : dependants
    }, new Array<string>())

/**
 * @hidden
 */
export const populateDependants = (stacks: StackProps[]): StackProps[] =>
  stacks.reduce((collected, stack) => {
    const dependants = collectStackDirectDependants(stack.path, stacks)
    return [...collected, { ...stack, dependants }]
  }, new Array<StackProps>())

/**
 * @hidden
 */
export const processStackDependencies = (
  stacks: InternalStack[],
): InternalStack[] => {
  const processed = stacks
    .map((stack) => stack.toProps())
    .map((stack) => {
      const stackDependencies = stack.dependencies.map((dependency) => {
        const matching = stacks
          .filter((other) => other.path.startsWith(dependency))
          .map((other) => other.path)

        if (matching.length === 0) {
          throw new TakomoError(
            `Dependency ${dependency} in stack ${stack.path} refers to a non-existing stack`,
          )
        }

        return matching
      })

      const parameterDependencies = Array.from(
        stack.parameters.entries(),
      ).reduce((collected, [parameterName, resolver]) => {
        const matchingParamDeps = resolver
          .getDependencies()
          .map((dependency) => {
            const matching = stacks
              .filter((other) => other.path.startsWith(dependency))
              .map((other) => other.path)

            if (matching.length === 0) {
              throw new TakomoError(
                `Dependency ${dependency} in parameter ${parameterName} of stack ${stack.path} refers to a non-existing stack`,
              )
            }

            return matching
          })

        return [...collected, ...flatten(matchingParamDeps)]
      }, new Array<StackPath>())

      return {
        ...stack,
        dependencies: uniq(
          flatten([...stackDependencies, ...parameterDependencies]),
        ),
      }
    })

  return populateDependants(processed).map((props) => createStack(props))
}

const sortStacks = (
  stacks: ReadonlyArray<InternalStack>,
  selector: (stack: InternalStack) => ReadonlyArray<StackPath>,
): ReadonlyArray<InternalStack> => {
  const unsorted = new Map(stacks.map((s) => [s.path, s]))
  const sorted = new Array<InternalStack>()
  while (unsorted.size > 0) {
    Array.from(unsorted.values())
      .filter((s) => selector(s).filter((d) => unsorted.has(d)).length === 0)
      .sort((a, b) => a.path.localeCompare(b.path))
      .forEach((s) => {
        sorted.push(s)
        unsorted.delete(s.path)
      })
  }

  return sorted
}

/**
 * @hidden
 */
export const sortStacksForUndeploy = (
  stacks: ReadonlyArray<InternalStack>,
): ReadonlyArray<InternalStack> => sortStacks(stacks, (s) => s.dependants)

/**
 * @hidden
 */
export const sortStacksForDeploy = (
  stacks: ReadonlyArray<InternalStack>,
): ReadonlyArray<InternalStack> => sortStacks(stacks, (s) => s.dependencies)
