import R from "ramda"
import {
  createStack,
  InternalStack,
  normalizeStackPath,
  StackPath,
  StackProps,
} from "../stacks/stack"
import { TakomoError } from "../utils/errors"
import { ObsoleteDependenciesError } from "./errors"

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

export const checkCyclicDependencies = (
  stacks: Map<StackPath, InternalStack>,
): void => {
  stacks.forEach((s) => checkCyclicDependenciesForStack(s, stacks, [s.path]))
}

export const checkObsoleteDependencies = (
  stacks: Map<StackPath, InternalStack>,
): void => {
  const stacksWithObsoleteDependencies = Array.from(stacks.values())
    .filter((stack) => !stack.obsolete)
    .map((stack) => {
      const obsoleteDependencies = stack.dependencies.filter(
        (dependencyPath) => {
          const dependencyStack = stacks.get(dependencyPath)
          if (!dependencyStack) {
            throw new Error(
              `Expected stack to found with path: ${dependencyPath}`,
            )
          }
          return dependencyStack.obsolete
        },
      )

      return {
        from: stack.path,
        to: obsoleteDependencies,
      }
    })
    .filter(({ to }) => to.length > 0)

  if (stacksWithObsoleteDependencies.length > 0) {
    throw new ObsoleteDependenciesError(stacksWithObsoleteDependencies)
  }
}

export const collectAllDependencies = (
  stackPath: StackPath,
  stacks: InternalStack[],
): StackPath[] => {
  const stack = stacks.find((s) => s.path === stackPath)!
  return R.uniq(
    stack.dependencies.reduce((collected, dependencyPath) => {
      const childDependencies = collectAllDependencies(dependencyPath, stacks)
      return [...collected, ...childDependencies, dependencyPath]
    }, new Array<StackPath>()),
  )
}

export const collectAllDependents = (
  stackPath: StackPath,
  stacks: InternalStack[],
): StackPath[] => {
  const stack = stacks.find((s) => s.path === stackPath)!
  return R.uniq(
    stack.dependents.reduce((collected, dependentPath) => {
      const childDependents = collectAllDependents(dependentPath, stacks)
      return [...collected, ...childDependents, dependentPath]
    }, new Array<StackPath>()),
  )
}

export const collectStackDirectDependents = (
  stackPath: StackPath,
  stacks: StackProps[],
): string[] =>
  stacks
    .filter((s) => s.path !== stackPath)
    .reduce((dependents, s) => {
      return s.dependencies.includes(stackPath)
        ? [...dependents, s.path]
        : dependents
    }, new Array<string>())

export const populateDependents = (stacks: StackProps[]): StackProps[] =>
  stacks.reduce((collected, stack) => {
    const dependents = collectStackDirectDependents(stack.path, stacks)
    return [...collected, { ...stack, dependents }]
  }, new Array<StackProps>())

export const processStackDependencies = (
  stacks: ReadonlyArray<InternalStack>,
): ReadonlyArray<InternalStack> => {
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
            const normalizedDependency = normalizeStackPath(
              stack.stackGroupPath,
              dependency,
            )

            const matching = stacks
              .filter((other) => other.path.startsWith(normalizedDependency))
              .map((other) => other.path)

            if (matching.length === 0) {
              throw new TakomoError(
                `Dependency ${dependency} in parameter ${parameterName} of stack ${stack.path} refers to a non-existing stack`,
              )
            }

            return matching
          })

        return [...collected, ...matchingParamDeps.flat()]
      }, new Array<StackPath>())

      return {
        ...stack,
        dependencies: R.uniq(
          [...stackDependencies, ...parameterDependencies].flat(),
        ),
      }
    })

  return populateDependents(processed).map((props) => createStack(props))
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

export const sortStacksForUndeploy = (
  stacks: ReadonlyArray<InternalStack>,
): ReadonlyArray<InternalStack> => sortStacks(stacks, (s) => s.dependents)

export const sortStacksForDeploy = (
  stacks: ReadonlyArray<InternalStack>,
): ReadonlyArray<InternalStack> => sortStacks(stacks, (s) => s.dependencies)
