import createCachedDataSource from './index'

const createMockSource = (data: any, timeout = 0) => () =>
  new Promise(resolve => {
    setTimeout(() => resolve(data), timeout)
  })

describe('createCachedDataSource', () => {
  it('get()', async () => {
    let testData = 0
    const dataSource = createCachedDataSource({
      source: createMockSource(testData++),
      updateInterval: 1000
    })
    expect(await dataSource.get()).toEqual(0)
    setTimeout(async () => {
      expect(await dataSource.get()).toEqual(2)
    }, 1200)
    setTimeout(async () => {
      expect(await dataSource.get()).toEqual(3)
    }, 2200)
  })
  it('get() parrallelized', async () => {
    let testData = 0
    const dataSource = createCachedDataSource({
      source: createMockSource(testData++),
      updateInterval: 1000
    })
    dataSource.get();
    expect(await dataSource.get()).toEqual(0)
    setTimeout(async () => {
      expect(await dataSource.get()).toEqual(2)
    }, 1200)
    setTimeout(async () => {
      expect(await dataSource.get()).toEqual(3)
    }, 2200)
  })

  it('destroy', async () => {
    let testData = 0
    const dataSource = createCachedDataSource({
      source: createMockSource(testData++),
      updateInterval: 1000
    })
    expect(await dataSource.get()).toEqual(0)
    setTimeout(async () => {
      expect(await dataSource.get()).toEqual(1)
    }, 1200)
    dataSource.destroy()
    expect(await dataSource.get()).toEqual(null)
  })

  it('reads from cache', async () => {
    const mockSource = jest.fn().mockReturnValue('x')
    const dataSource = createCachedDataSource({
      source: mockSource,
      updateInterval: 10000
    })
    expect(await dataSource.get()).toEqual('x')
    expect(mockSource).toHaveBeenCalledTimes(1)
    expect(await dataSource.get()).toEqual('x')
    expect(mockSource).toHaveBeenCalledTimes(1)
    expect(await dataSource.get()).toEqual('x')
    expect(mockSource).toHaveBeenCalledTimes(1)
  })

  it('returns null if data source returns null', async () => {
    const mockSource = jest.fn().mockReturnValue(null)
    const dataSource = createCachedDataSource({
      source: mockSource,
      updateInterval: 10000
    })
    expect(await dataSource.get()).toEqual(null)
  })
})
