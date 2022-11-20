import { join } from "path"
import { createFileSystemCache } from "../../src/takomo-config-repository-fs/cache"
import { createConsoleLogger } from "../../src/utils/logging"

const cacheDir = join(process.cwd(), "test", ".cache")

const cache = createFileSystemCache(
  createConsoleLogger({ logLevel: "debug" }),
  cacheDir,
)

describe("file system cache", () => {
  test("cache miss", async () => {
    const value = await cache.get("value-not-found.txt")
    expect(value).toBeUndefined()
  })

  test("put to cache and reset", async () => {
    const value = "my-cached-value"
    const key = "my-value.txt"
    await cache.put(key, "my-cached-value")
    const cachedValue = await cache.get(key)
    expect(cachedValue).toStrictEqual(value)

    await cache.reset()
    const cachedValueAfterReset = await cache.get(key)
    expect(cachedValueAfterReset).toBeUndefined()
  })
})
