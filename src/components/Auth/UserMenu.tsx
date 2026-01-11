import React, { useState, useRef, useEffect } from 'react'
import { Heart, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { UserAvatar } from './UserAvatar'

interface UserMenuProps {
  onViewFavorites: () => void
}

export const UserMenu: React.FC<UserMenuProps> = ({ onViewFavorites }) => {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  const displayName = user?.email?.split('@')[0] || '用户'

  return (
    <div className="relative" ref={menuRef}>
      {/* 用户按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-matsu-bg/50 transition-colors"
      >
        <UserAvatar email={user?.email} size="sm" />
        <span className="text-sm font-medium text-matsu-text max-w-[100px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-matsu-text/60 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-matsu-border py-1 z-50">
          <div className="px-4 py-2 border-b border-matsu-border">
            <p className="text-xs text-matsu-text/60">登录账号</p>
            <p className="text-sm font-medium text-matsu-text truncate">{user?.email}</p>
          </div>

          <button
            onClick={() => {
              onViewFavorites()
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-2 text-sm text-matsu-text hover:bg-matsu-bg/50 transition-colors flex items-center gap-2"
          >
            <Heart className="w-4 h-4" />
            我的收藏
          </button>

          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      )}
    </div>
  )
}
