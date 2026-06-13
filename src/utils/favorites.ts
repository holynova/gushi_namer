import type { GeneratedName } from './namer'

const STORAGE_KEY = 'gushi_namer:favorites:v1'

export interface FavoriteItem extends GeneratedName {
  id: string
  familyName: string
  savedAt: number
}

export interface FavoritesExport {
  app: 'gushi_namer'
  exportedAt: string
  version: 1
  favorites: FavoriteItem[]
}

const createFavoriteId = (familyName: string, name: string, savedAt = Date.now()) =>
  `${familyName}-${name}-${savedAt}`

const normalizeFavorite = (item: Partial<FavoriteItem>): FavoriteItem | null => {
  if (!item.name || !item.familyName || !item.sentence || !item.title || !item.book) {
    return null
  }

  const savedAt = typeof item.savedAt === 'number' ? item.savedAt : Date.now()

  return {
    id: item.id || createFavoriteId(item.familyName, item.name, savedAt),
    name: item.name,
    familyName: item.familyName,
    sentence: item.sentence,
    content: item.content || item.sentence,
    title: item.title,
    author: item.author || '佚名',
    book: item.book,
    dynasty: item.dynasty || '',
    savedAt,
  }
}

const readFavorites = (): FavoriteItem[] => {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : parsed?.favorites
    if (!Array.isArray(list)) return []

    return list
      .map((item) => normalizeFavorite(item))
      .filter((item): item is FavoriteItem => Boolean(item))
      .sort((a, b) => b.savedAt - a.savedAt)
  } catch (error) {
    console.error('Failed to load local favorites:', error)
    return []
  }
}

const writeFavorites = (favorites: FavoriteItem[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
}

export const getFavorites = async (): Promise<FavoriteItem[]> => {
  return readFavorites()
}

export const saveFavorite = async (
  name: GeneratedName,
  familyName: string
): Promise<void> => {
  const favorites = readFavorites()
  const exists = favorites.some(
    (item) => item.name === name.name && item.familyName === familyName
  )

  if (exists) return

  const savedAt = Date.now()
  const favorite: FavoriteItem = {
    ...name,
    id: createFavoriteId(familyName, name.name, savedAt),
    familyName,
    savedAt,
  }

  writeFavorites([favorite, ...favorites])
}

export const removeFavorite = async (id: string): Promise<void> => {
  writeFavorites(readFavorites().filter((item) => item.id !== id))
}

export const isFavorite = async (
  name: string,
  familyName: string
): Promise<boolean> => {
  return readFavorites().some(
    (item) => item.name === name && item.familyName === familyName
  )
}

export const toggleFavorite = async (
  name: GeneratedName,
  familyName: string
): Promise<boolean> => {
  const favorites = readFavorites()
  const existing = favorites.find(
    (item) => item.name === name.name && item.familyName === familyName
  )

  if (existing) {
    writeFavorites(favorites.filter((item) => item.id !== existing.id))
    return false
  }

  await saveFavorite(name, familyName)
  return true
}

export const exportFavorites = async (): Promise<FavoritesExport> => ({
  app: 'gushi_namer',
  exportedAt: new Date().toISOString(),
  version: 1,
  favorites: readFavorites(),
})

export const importFavorites = async (
  payload: unknown
): Promise<{ imported: number; total: number }> => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as Partial<FavoritesExport>)?.favorites)
      ? (payload as Partial<FavoritesExport>).favorites
      : null

  if (!list) {
    throw new Error('JSON 格式不正确，请导入收藏导出的 JSON 文件')
  }

  const current = readFavorites()
  const byKey = new Map(
    current.map((item) => [`${item.familyName}-${item.name}-${item.title}`, item])
  )
  let imported = 0

  list.forEach((rawItem) => {
    const item = normalizeFavorite(rawItem)
    if (!item) return

    const key = `${item.familyName}-${item.name}-${item.title}`
    if (!byKey.has(key)) {
      byKey.set(key, item)
      imported += 1
    }
  })

  const merged = Array.from(byKey.values()).sort((a, b) => b.savedAt - a.savedAt)
  writeFavorites(merged)

  return { imported, total: merged.length }
}
