"use client"

import { walrusService, type WalrusContentType, type WalrusBlobReference } from './walrus-client'

// Cache interface for storing blob references
interface WalrusCacheEntry {
  blobReference: WalrusBlobReference
  cachedData?: string | object
  lastAccessed: string
}

// Local cache for frequently accessed data
class WalrusCache {
  private cache = new Map<string, WalrusCacheEntry>()
  private maxCacheSize = 100
  private cacheKeyPrefix = 'walrus_cache_'

  constructor() {
    this.loadFromLocalStorage()
  }

  private loadFromLocalStorage() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.cacheKeyPrefix))
      keys.forEach(key => {
        const data = localStorage.getItem(key)
        if (data) {
          const entry: WalrusCacheEntry = JSON.parse(data)
          const blobId = key.replace(this.cacheKeyPrefix, '')
          this.cache.set(blobId, entry)
        }
      })
    } catch (error) {
      console.warn('Failed to load Walrus cache from localStorage:', error)
    }
  }

  private saveToLocalStorage(blobId: string, entry: WalrusCacheEntry) {
    try {
      localStorage.setItem(this.cacheKeyPrefix + blobId, JSON.stringify(entry))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  set(blobId: string, blobReference: WalrusBlobReference, cachedData?: string | object) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime())[0][0]
      this.cache.delete(oldestKey)
      localStorage.removeItem(this.cacheKeyPrefix + oldestKey)
    }

    const entry: WalrusCacheEntry = {
      blobReference,
      cachedData,
      lastAccessed: new Date().toISOString()
    }

    this.cache.set(blobId, entry)
    this.saveToLocalStorage(blobId, entry)
  }

  get(blobId: string): WalrusCacheEntry | null {
    const entry = this.cache.get(blobId)
    if (entry) {
      entry.lastAccessed = new Date().toISOString()
      this.saveToLocalStorage(blobId, entry)
      return entry
    }
    return null
  }

  has(blobId: string): boolean {
    return this.cache.has(blobId)
  }

  clear() {
    this.cache.clear()
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.cacheKeyPrefix))
    keys.forEach(key => localStorage.removeItem(key))
  }
}

// Global cache instance
const walrusCache = new WalrusCache()

/**
 * Convert File to Uint8Array
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      resolve(new Uint8Array(arrayBuffer))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Convert base64 data URL to Uint8Array
 */
export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1]
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * Convert Uint8Array to base64 data URL
 */
export function uint8ArrayToDataUrl(bytes: Uint8Array, mimeType: string = 'application/octet-stream'): string {
  const base64 = btoa(String.fromCharCode(...bytes))
  return `data:${mimeType};base64,${base64}`
}

/**
 * Convert string to Uint8Array
 */
export function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

/**
 * Convert Uint8Array to string
 */
export function uint8ArrayToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

/**
 * Convert object to JSON Uint8Array
 */
export function objectToUint8Array(obj: any): Uint8Array {
  const jsonString = JSON.stringify(obj)
  return stringToUint8Array(jsonString)
}

/**
 * Convert Uint8Array to object
 */
export function uint8ArrayToObject<T = any>(bytes: Uint8Array): T {
  const jsonString = uint8ArrayToString(bytes)
  return JSON.parse(jsonString)
}

/**
 * Get MIME type from file extension or data URL
 */
export function getMimeType(input: string | File): string {
  if (input instanceof File) {
    return input.type || 'application/octet-stream'
  }
  
  if (input.startsWith('data:')) {
    const match = input.match(/data:([^;]+)/)
    return match ? match[1] : 'application/octet-stream'
  }
  
  // Guess from extension
  const ext = input.toLowerCase().split('.').pop()
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'json': 'application/json',
    'txt': 'text/plain',
  }
  
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

/**
 * Store image on Walrus (handles File or data URL)
 */
export async function storeImage(
  image: File | string,
  contentType: WalrusContentType,
  signer?: any, // Optional - not used in HTTP API mode
  options?: {
    epochs?: number
    deletable?: boolean
  }
): Promise<WalrusBlobReference> {
  let data: Uint8Array
  let mimeType: string
  let originalName: string | undefined

  if (image instanceof File) {
    data = await fileToUint8Array(image)
    mimeType = image.type
    originalName = image.name
  } else {
    data = dataUrlToUint8Array(image)
    mimeType = getMimeType(image)
  }

  return await walrusService.storeBlob(data, contentType, {
    ...options,
    mimeType,
    originalName,
    signer
  })
}

/**
 * Store JSON data on Walrus
 */
export async function storeJsonData(
  data: any,
  contentType: WalrusContentType,
  signer?: any, // Optional - not used in HTTP API mode
  options?: {
    epochs?: number
    deletable?: boolean
  }
): Promise<WalrusBlobReference> {
  const uint8Data = objectToUint8Array(data)

  return await walrusService.storeBlob(uint8Data, contentType, {
    ...options,
    mimeType: 'application/json',
    signer
  })
}

/**
 * Retrieve image from Walrus as data URL
 */
export async function retrieveImageAsDataUrl(blobId: string, mimeType?: string): Promise<string> {
  // Check cache first
  const cached = walrusCache.get(blobId)
  if (cached && typeof cached.cachedData === 'string') {
    return cached.cachedData
  }

  const bytes = await walrusService.retrieveBlob(blobId)
  const finalMimeType = mimeType || cached?.blobReference.metadata.mimeType || 'image/jpeg'
  const dataUrl = uint8ArrayToDataUrl(bytes, finalMimeType)

  // Cache the result
  if (cached) {
    walrusCache.set(blobId, cached.blobReference, dataUrl)
  }

  return dataUrl
}

/**
 * Retrieve JSON data from Walrus
 */
export async function retrieveJsonData<T = any>(blobId: string): Promise<T> {
  // Check cache first
  const cached = walrusCache.get(blobId)
  if (cached && typeof cached.cachedData === 'object') {
    return cached.cachedData as T
  }

  const bytes = await walrusService.retrieveBlob(blobId)
  const data = uint8ArrayToObject<T>(bytes)

  // Cache the result
  if (cached) {
    walrusCache.set(blobId, cached.blobReference, data as string | object)
  }

  return data
}

/**
 * Store blob reference in cache
 */
export function cacheBlobReference(blobId: string, blobReference: WalrusBlobReference) {
  walrusCache.set(blobId, blobReference)
}

/**
 * Get cached blob reference
 */
export function getCachedBlobReference(blobId: string): WalrusBlobReference | null {
  const cached = walrusCache.get(blobId)
  return cached ? cached.blobReference : null
}

/**
 * Check if blob is cached
 */
export function isBlobCached(blobId: string): boolean {
  return walrusCache.has(blobId)
}

/**
 * Clear all cached data
 */
export function clearWalrusCache() {
  walrusCache.clear()
}

/**
 * Fallback storage key generator for localStorage
 */
export function getFallbackStorageKey(contentType: WalrusContentType, identifier: string): string {
  return `walrus_fallback_${contentType}_${identifier}`
}

/**
 * Store data with fallback to localStorage
 */
export async function storeWithFallback<T>(
  data: T,
  contentType: WalrusContentType,
  identifier: string,
  signer?: any, // Optional - not used in HTTP API mode
  options?: {
    epochs?: number
    deletable?: boolean
  }
): Promise<{ blobId?: string; fallback: boolean }> {
  const fallbackKey = getFallbackStorageKey(contentType, identifier)

  try {
    if (!walrusService.isAvailable()) {
      throw new Error('Walrus service not available')
    }

    let blobReference: WalrusBlobReference

    if (typeof data === 'string' && data.startsWith('data:')) {
      // Image data URL
      blobReference = await storeImage(data, contentType, signer, options)
    } else if (typeof data === 'object' || typeof data === 'string') {
      // JSON data
      blobReference = await storeJsonData(data, contentType, signer, options)
    } else {
      throw new Error('Unsupported data type')
    }

    // Store blob reference for future retrieval
    cacheBlobReference(blobReference.blobId, blobReference)
    
    // Also store in localStorage as backup
    localStorage.setItem(fallbackKey, JSON.stringify({
      blobId: blobReference.blobId,
      blobReference,
      data
    }))

    return { blobId: blobReference.blobId, fallback: false }
  } catch (error) {
    console.warn('Failed to store on Walrus, falling back to localStorage:', error)
    
    // Fallback to localStorage
    localStorage.setItem(fallbackKey, JSON.stringify({ data }))
    return { fallback: true }
  }
}

/**
 * Retrieve data with fallback from localStorage
 */
export async function retrieveWithFallback<T>(
  blobId: string | null,
  contentType: WalrusContentType,
  identifier: string
): Promise<T | null> {
  const fallbackKey = getFallbackStorageKey(contentType, identifier)
  
  if (blobId) {
    try {
      if (contentType.includes('image')) {
        return await retrieveImageAsDataUrl(blobId) as T
      } else {
        return await retrieveJsonData<T>(blobId)
      }
    } catch (error) {
      console.warn('Failed to retrieve from Walrus, trying localStorage fallback:', error)
    }
  }

  // Try localStorage fallback
  try {
    const fallbackData = localStorage.getItem(fallbackKey)
    if (fallbackData) {
      const parsed = JSON.parse(fallbackData)
      return parsed.data as T
    }
  } catch (error) {
    console.warn('Failed to retrieve from localStorage fallback:', error)
  }

  return null
}
