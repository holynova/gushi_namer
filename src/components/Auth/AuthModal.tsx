import React, { useState } from 'react'
import { X } from 'lucide-react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { ResetPasswordForm } from './ResetPasswordForm'

type AuthView = 'login' | 'register' | 'reset'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: AuthView
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialView = 'login',
}) => {
  const [view, setView] = useState<AuthView>(initialView)

  if (!isOpen) return null

  const handleSuccess = () => {
    onClose()
    // 重置视图为登录
    setTimeout(() => setView('login'), 300)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-matsu-text/40 hover:text-matsu-text transition-colors"
            aria-label="关闭"
          >
            <X className="w-6 h-6" />
          </button>

          {/* 表单内容 */}
          {view === 'login' && (
            <LoginForm
              onSwitchToRegister={() => setView('register')}
              onSwitchToReset={() => setView('reset')}
              onSuccess={handleSuccess}
            />
          )}

          {view === 'register' && (
            <RegisterForm
              onSwitchToLogin={() => setView('login')}
              onSuccess={handleSuccess}
            />
          )}

          {view === 'reset' && <ResetPasswordForm onBack={() => setView('login')} />}
        </div>
      </div>
    </div>
  )
}
