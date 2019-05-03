interface CachedDataSourceConfig<T> {
  source: () => Promise<T | any>
  onError?: (error: any) => void
  updateInterval: number
  debug?: boolean | undefined
  id?: string | undefined
}

interface CachedDataSource<T> {
  get: () => Promise<T | null>
  destroy: () => void
}

export default function createCachedDataSource<T>(
  config: CachedDataSourceConfig<T>
): CachedDataSource<T> {
  const { source, onError, debug = false, id = '', updateInterval } = config
  let data: T | null = null
  let fetchInterval: number = null as any
  let isFetching: boolean = false
  let isDestroyed: boolean = false

  const shouldRefetch = (forceFetch: boolean) =>
    forceFetch || (!isFetching && !isDestroyed && !data)

  const fetchData = async (forceFetch: boolean = false): Promise<T | null> => {
    if (shouldRefetch(forceFetch)) {
      isFetching = true
      try {
        const response = await source()
        const result =
          response && response.json ? await response.json() : response
        data = result
        isFetching = false
        log('Data fetched', data)
        return result
      } catch (error) {
        isFetching = false
        log('Error occured', error)
        onError && onError(error)
      }
    }
    return data
  }

  const startFetching = () => {
    if (updateInterval) {
      log(
        `Periodic fetch started, every ${Math.floor(
          updateInterval / 1000
        )} seconds`
      )
      fetchInterval = setInterval(async () => {
        await fetchData(true)
      }, updateInterval)
    }
  }

  const destroy = () => {
    clearInterval(fetchInterval)
    isDestroyed = true
    data = null
    log('Is destroyed')
  }

  const log = (message: string, params?: any) => {
    debug && console.log(`${id} - ${message}`, params)
  }

  startFetching()

  return {
    get: async () => await fetchData(),
    destroy
  }
}
