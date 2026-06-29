import type { IconifySearchResult } from '../types.js'
import type { IconifyInfo, IconifyJSONIconsData } from '@iconify/types'

import { iconToSVG } from '@iconify/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'

const BASE_API_URL = 'https://api.iconify.design'

const searchCache = new Map<string, Record<string, string[]>>()
const iconSetInfoCache = new Map<string, IconifyInfo | null>()

function createLRUCache<T>(cache: Map<string, T>, maxEntries = 100) {
  const get = (key: string) => {
    const value = cache.get(key)
    if (!value) {
      return null
    }
    cache.delete(key)
    cache.set(key, value)
    return value
  }

  const set = (key: string, value: T) => {
    if (cache.has(key)) {
      cache.delete(key)
    }
    cache.set(key, value)
    if (cache.size > maxEntries) {
      const oldestKey = cache.keys().next().value
      if (oldestKey !== undefined) {
        cache.delete(oldestKey)
      }
    }
  }
  return { get, set }
}

const buildSearchCacheKey = (collectionsKey: string, term: string) => `${collectionsKey}::${term}`

function fetchJson<T>({ signal, url }: { signal?: AbortSignal; url: string | URL }): Promise<T> {
  return fetch(url, { signal })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network error: status ${response.status}`)
      }

      return response.json()
    })
    .then(
      (result) => result as T,
      (error) => {
        if (error instanceof Error) {
          throw error
        } else {
          console.error(`Unknown error: ${error}`)
          throw new Error('Something went wrong')
        }
      },
    )
}

const { get, set } = createLRUCache(searchCache, 100)

export function useSearch({ collections }: { collections: null | string[] }) {
  const [term, setTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useDebounce(term, 500)
  const [data, setData] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [isPreviousData, setIsPreviousData] = useState(false)

  const fetchControllerRef = useRef<AbortController | null>(null)
  const lastCacheKeyRef = useRef<null | string>(null)

  const updateTerm = useCallback(
    (newTerm: string, updateImmediately = false) => {
      setTerm(newTerm)
      if (updateImmediately) {
        setDebouncedTerm(newTerm)
      }
    },
    [setDebouncedTerm],
  )
  const normalizedTerm = debouncedTerm.trim().toLowerCase()
  const normalizedCollections =
    collections && collections.length ? [...collections].sort().join(',') : 'all'

  useEffect(() => {
    // check if debouncedTerm is null and no iconsets in data
    if (!normalizedTerm) {
      fetchControllerRef.current?.abort()
      // setData({}) // clear icon grid when debouncedTerm is empty
      setIsLoading(false)
      setError(null)
      setIsPreviousData(false)
      lastCacheKeyRef.current = null
      return
    }

    const cacheKey = buildSearchCacheKey(normalizedCollections, normalizedTerm)
    const cachedIcons = get(cacheKey)
    if (cachedIcons) {
      setData(cachedIcons)
      setIsLoading(false)
      setError(null)
      setIsPreviousData(false)
      lastCacheKeyRef.current = cacheKey
      return
    }

    setIsPreviousData(Boolean(lastCacheKeyRef.current && Object.keys(data).length))

    fetchControllerRef.current?.abort()
    const controller = new AbortController()
    fetchControllerRef.current = controller

    setIsLoading(true)
    setError(null)
    lastCacheKeyRef.current = cacheKey

    const url = new URL('/search', BASE_API_URL)
    url.searchParams.append('query', normalizedTerm)
    url.searchParams.append('limit', '60')

    if (Array.isArray(collections) && collections.length > 0) {
      url.searchParams.append('prefixes', normalizedCollections)
    }

    const fetchData = async () => {
      try {
        const result = await fetchJson<IconifySearchResult>({ signal: controller.signal, url })

        Object.entries(result.collections).forEach(([prefix, info]) => {
          iconSetInfoCache.set(prefix, info)
        })

        // construct a map of icon names grouped by icon set
        const iconMap: Record<string, string[]> = {}
        result.icons.forEach((icon) => {
          const [prefix, ...nameParts] = icon.split(':')
          const name = nameParts.join(':')

          if (prefix && name) {
            if (!iconMap[prefix]) {
              iconMap[prefix] = []
            }
            iconMap[prefix].push(name)
          }
        })

        set(cacheKey, iconMap)

        if (!controller.signal.aborted) {
          setData(iconMap)
          setIsPreviousData(false)
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }

        const errorInstance =
          err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Unknown error')
        setError(errorInstance.message)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void fetchData()

    return () => controller.abort()
  }, [normalizedCollections, normalizedTerm])

  return {
    data,
    debouncedTerm,
    error,
    isError: Boolean(error),
    isLoading,
    isPreviousData,
    setTerm: updateTerm,
    term,
  }
}

export function useIconSetInfo({ prefix }: { prefix?: null | string }) {
  const [data, setData] = useState<IconifyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!prefix) {
      setData(null)
      setIsLoading(false)
      setError(null)
      return
    }

    if (iconSetInfoCache.has(prefix)) {
      setData(iconSetInfoCache.get(prefix) || null)
      setIsLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()

    setIsLoading(true)
    setError(null)

    const fetchInfo = async () => {
      try {
        const url = new URL('/collection', BASE_API_URL)

        url.searchParams.append('prefix', prefix)
        url.searchParams.append('info', 'true')

        const result = await fetchJson<{ info: IconifyInfo }>({
          signal: controller.signal,
          url,
        })

        iconSetInfoCache.set(prefix, result?.info ?? null)
        if (!controller.signal.aborted) {
          setData(result?.info ?? null)
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }

        const errorInstance =
          err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Unknown error')
        setError(errorInstance)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void fetchInfo()

    return () => controller.abort()
  }, [prefix])

  return {
    data,
    error,
    isError: Boolean(error),
    isLoading,
  }
}

export function useFetchIconData(iconsByPrefix: Record<string, string[]>) {
  // mental model: prefix = iconset
  const [icons, setIcons] = useState<Record<string, string>>({}) // {"mdi:home": "<svg/>"}
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const fetchControllerRef = useRef<AbortController | null>(null)

  const iconsKey = useMemo(() => {
    if (!Object.keys(iconsByPrefix).length) {
      return ''
    }
    return Object.entries(iconsByPrefix)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([set, list]) => `${set}:${[...list].sort().join(',')}`)
      .join('|')
  }, [iconsByPrefix])

  useEffect(() => {
    fetchControllerRef.current?.abort()
    const controller = new AbortController()
    fetchControllerRef.current = controller

    const fetchIcons = async () => {
      if (!Object.keys(iconsByPrefix).length) {
        if (controller.signal.aborted) {
          return
        }
        // clear state if controller is not aborted, but iconsByPrefix is empty
        setIcons({})
        setError(null)
        return
      }
      setIsLoading(true)
      setError(null)

      const iconsMap: Record<string, string> = {}

      try {
        const promises = []

        const fetchPrefixData = async (prefix: string, filteredIconList: string) => {
          const endpoint = new URL(`${prefix}.json`, BASE_API_URL)
          endpoint.searchParams.append('icons', filteredIconList)
          const iconsData = await fetchJson<IconifyJSONIconsData>({
            signal: controller.signal,
            url: endpoint,
          })
          const prefixIcons: Record<string, string> = {}
          for (const [iconName, data] of Object.entries(iconsData.icons)) {
            const { attributes, body, viewBox } = iconToSVG(data)
            attributes.width = '16'
            attributes.height = '16'
            // const svg = iconToHTML(replaceIDs(body), attributes)
            const svg = `<svg width="${attributes.width}" height="${attributes.height}" viewBox="0 0 24 24">${body}</svg>`
            prefixIcons[`${prefix}:${iconName}`] = svg
          }
          return prefixIcons
        }

        for (const [prefix, iconList] of Object.entries(iconsByPrefix)) {
          const filteredIconList = iconList
            // .filter((icon) => icon.endsWith('rounded') && !icon.endsWith('outline-rounded'))
            .join(',')
          if (filteredIconList) {
            promises.push(fetchPrefixData(prefix, filteredIconList))
          }
        }

        if (!promises.length && !controller.signal.aborted) {
          setIcons({})
          setError(null)
          return
        }

        const results = await Promise.allSettled(promises)
        let hadError = false
        for (const result of results) {
          if (result.status === 'fulfilled') {
            Object.assign(iconsMap, result.value)
          } else {
            hadError = true
          }
        }

        if (!controller.signal.aborted) {
          setIcons(iconsMap)
          if (hadError) {
            setError('Some icon sets failed to load')
          }
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }
    void fetchIcons()
    return () => controller.abort()
  }, [iconsKey])

  return { error, icons, isLoading }
}
