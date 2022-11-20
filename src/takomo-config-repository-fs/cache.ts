import { dirname, join } from "path"
import { Cache } from "../takomo-core"
import { TakomoError } from "../utils/errors"
import {
  createDir,
  createFile,
  dirExists,
  fileExists,
  FilePath,
  readFileContents,
  removeDir,
} from "../utils/files"
import { TkmLogger } from "../utils/logging"

const toFilePath = (cacheDir: FilePath, key: string): FilePath =>
  join(cacheDir, key)

interface CacheItem {
  readonly value: string
  readonly version: number
  readonly timestamp: number
}

const currentCacheEngineVersion = 1

const createCacheItem = (value: string): CacheItem => ({
  value,
  version: currentCacheEngineVersion,
  timestamp: Date.now(),
})

export const createFileSystemCache = (
  logger: TkmLogger,
  cacheDir: FilePath,
): Cache => {
  logger.debug(`Initialize file system cache with cache dir: ${cacheDir}`)

  const get = async (key: string): Promise<string | undefined> => {
    const filePath = toFilePath(cacheDir, key)
    if (!(await fileExists(filePath))) {
      logger.debug(
        `Cached value not found with key: ${key}, file path: ${filePath}`,
      )
      return undefined
    }

    logger.debug(`Cached value found with key: ${key}, file path: ${filePath}`)

    try {
      const fileContents = await readFileContents(filePath)
      const cacheItem = JSON.parse(fileContents) as CacheItem
      if (cacheItem.version !== currentCacheEngineVersion) {
        logger.debug(
          `Cached value found with key: ${key}, file path: ${filePath} has incompatible version`,
        )

        return undefined
      }

      return cacheItem.value
    } catch (e) {
      throw new TakomoError(
        `Failed to load cached value from path: ${filePath}`,
        {
          info: "File might be corrupted or contain invalid content",
          instructions: [
            `Remove the file in question or entire cache dir ${cacheDir} and try again`,
          ],
        },
      )
    }
  }

  const put = async (key: string, value: string): Promise<void> => {
    const filePath = toFilePath(cacheDir, key)
    const dirPath = dirname(filePath)
    if (!(await dirExists(dirPath))) {
      await createDir(dirPath)
    }

    logger.debug(`Put value to cache with key: ${key}, file path: ${filePath}`)

    const cacheItem = createCacheItem(value)
    const serializedCacheItem = JSON.stringify(cacheItem)
    await createFile(filePath, serializedCacheItem)
  }

  const reset = async (): Promise<void> => {
    logger.debug(`Reset cache`)
    if (!(await dirExists(cacheDir))) {
      return
    }

    await removeDir(cacheDir)
  }

  return {
    reset,
    put,
    get,
  }
}
