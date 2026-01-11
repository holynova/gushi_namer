import React from 'react'

interface UserAvatarProps {
  email?: string | null
  size?: 'sm' | 'md' | 'lg'
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ email, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }

  // 获取邮箱首字母作为头像
  const initial = email?.charAt(0).toUpperCase() || 'U'

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-matsu-primary to-matsu-primaryHover text-white font-bold flex items-center justify-center`}
    >
      {initial}
    </div>
  )
}
