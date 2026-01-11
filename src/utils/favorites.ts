import { supabase } from '../config/supabase'
import type { GeneratedName } from './namer'
import type { Database } from '../types/database'

type FavoriteRow = Database['public']['Tables']['favorites']['Row']

export interface FavoriteItem extends GeneratedName {
  id: string
  familyName: string
  savedAt: number
}

/**
 * 获取当前用户的收藏列表
 */
export const getFavorites = async (): Promise<FavoriteItem[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // 转换数据格式
    return (data || []).map((row: FavoriteRow) => ({
      id: row.id,
      name: row.name,
      familyName: row.family_name,
      book: row.book,
      author: row.author || '',
      title: row.title,
      sentence: row.sentence,
      content: row.sentence, // 使用 sentence 作为 content
      dynasty: '', // 从 author 中提取或默认为空
      savedAt: new Date(row.created_at).getTime(),
    }))
  } catch (error) {
    console.error('Failed to load favorites:', error)
    return []
  }
}

/**
 * 保存收藏
 */
export const saveFavorite = async (
  name: GeneratedName,
  familyName: string
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('请先登录')
    }

    const { error } = await supabase.from('favorites').insert({
      user_id: user.id,
      name: name.name,
      family_name: familyName,
      book: name.book,
      author: name.author || null,
      title: name.title,
      sentence: name.sentence,
    })

    if (error) {
      // 处理重复收藏错误
      if (error.code === '23505') {
        throw new Error('该名字已在收藏中')
      }
      throw error
    }
  } catch (error) {
    console.error('Failed to save favorite:', error)
    throw error
  }
}

/**
 * 删除收藏
 */
export const removeFavorite = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('favorites').delete().eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Failed to remove favorite:', error)
    throw error
  }
}

/**
 * 检查是否已收藏
 */
export const isFavorite = async (
  name: string,
  familyName: string
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name)
      .eq('family_name', familyName)
      .limit(1)

    if (error) throw error

    return (data?.length || 0) > 0
  } catch (error) {
    console.error('Failed to check favorite:', error)
    return false
  }
}

/**
 * 切换收藏状态
 */
export const toggleFavorite = async (
  name: GeneratedName,
  familyName: string
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('请先登录')
    }

    // 查找是否已收藏
    const { data: existing, error: queryError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name.name)
      .eq('family_name', familyName)
      .limit(1)

    if (queryError) throw queryError

    if (existing && existing.length > 0) {
      // 已收藏，删除
      await removeFavorite(existing[0].id)
      return false
    } else {
      // 未收藏，添加
      await saveFavorite(name, familyName)
      return true
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
    throw error
  }
}
