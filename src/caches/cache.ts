export interface Cache {
  readonly get: (key: string) => Promise<unknown>
  readonly put: (key: string, value: unknown) => Promise<void>
  readonly reset: () => Promise<void>
}

export const inMemoryCache = () => {
  const cache = new Map<string, unknown>()

  return {
    get: async (key: string) => cache.get(key),
    put: async (key: string, value: unknown) => {
      cache.set(key, value)
    },
    reset: async () => cache.clear(),
  }
}
