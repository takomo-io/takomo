/**
 * Rule, that
 */
export type Rule<A, V> = (input: A) => V | undefined

export const evaluateRules = <A, V>(
  rules: Rule<A, V>[],
  input: A,
  defaultValue: (input: A) => V,
): V => {
  if (rules.length === 0) {
    return defaultValue(input)
  }

  const result = rules[0](input)
  return result ? result : evaluateRules(rules.slice(1), input, defaultValue)
}
