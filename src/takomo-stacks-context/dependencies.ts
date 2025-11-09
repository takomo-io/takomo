import * as R from "ramda"
import {
  createStandardStack,
  InternalStandardStack,
  StandardStackProps,
} from "../stacks/standard-stack.js"
import { TakomoError } from "../utils/errors.js"
import { ObsoleteDependenciesError } from "./errors.js"
import { normalizeStackPath, StackPath } from "../stacks/stack.js"

export const checkCyclicDependenciesForStack = (
  stack: InternalStandardStack,
  stacks: Map<StackPath, InternalStandardStack>,
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
  stacks: Map<StackPath, InternalStandardStack>,
): void => {
  stacks.forEach((s) => checkCyclicDependenciesForStack(s, stacks, [s.path]))
}

export const checkObsoleteDependencies = (
  stacks: Map<StackPath, InternalStandardStack>,
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
  stacks: InternalStandardStack[],
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
  stacks: InternalStandardStack[],
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
  stacks: StandardStackProps[],
): string[] =>
  stacks
    .filter((s) => s.path !== stackPath)
    .reduce((dependents, s) => {
      return s.dependencies.includes(stackPath)
        ? [...dependents, s.path]
        : dependents
    }, new Array<string>())

export const populateDependents = (
  stacks: StandardStackProps[],
): StandardStackProps[] =>
  stacks.reduce((collected, stack) => {
    const dependents = collectStackDirectDependents(stack.path, stacks)
    return [...collected, { ...stack, dependents }]
  }, new Array<StandardStackProps>())

export const processStackDependencies = (
  stacks: ReadonlyArray<InternalStandardStack>,
): ReadonlyArray<InternalStandardStack> => {
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

  return populateDependents(processed).map((props) =>
    createStandardStack(props),
  )
}

const sortStacks = (
  stacks: ReadonlyArray<InternalStandardStack>,
  selector: (stack: InternalStandardStack) => ReadonlyArray<StackPath>,
): ReadonlyArray<InternalStandardStack> => {
  const unsorted = new Map(stacks.map((s) => [s.path, s]))
  const sorted = new Array<InternalStandardStack>()
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
  stacks: ReadonlyArray<InternalStandardStack>,
): ReadonlyArray<InternalStandardStack> =>
  sortStacks(stacks, (s) => s.dependents)

export const sortStacksForDeploy = (
  stacks: ReadonlyArray<InternalStandardStack>,
): ReadonlyArray<InternalStandardStack> =>
  sortStacks(stacks, (s) => s.dependencies)
