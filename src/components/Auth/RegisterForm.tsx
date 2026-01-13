import React, { useState } from 'react'
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth, getAuthErrorMessage } from '../../contexts/AuthContext'
import { AuthError } from '@supabase/supabase-js'

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onSuccess: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  onSuccess,
}) => {
  const { signUp, signInWithOAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 验证密码一致性
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    // 验证密码强度
    if (password.length < 6) {
      setError('密码至少需要6个字符')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password)
      setSuccess(true)
      // 2秒后自动切换到登录
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err) {
      setError(getAuthErrorMessage(err as AuthError))
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: 'google' | 'github') => {
    setError('')
    setLoading(true)
    try {
      await signInWithOAuth(provider)
    } catch (err) {
      setError(getAuthErrorMessage(err as AuthError))
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-matsu-primary mb-2">注册成功！</h2>
        <p className="text-matsu-text/60">
          欢迎使用诗词起名器，正在为您登录...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-matsu-primary mb-2">注册</h2>
        <p className="text-matsu-text/60 text-sm">创建账号以保存您的收藏</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-matsu-text mb-1">
            邮箱
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-matsu-text/40" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-matsu-border rounded-lg focus:outline-none focus:ring-2 focus:ring-matsu-primary/50 bg-white"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-matsu-text mb-1">
            密码
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-matsu-text/40" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-matsu-border rounded-lg focus:outline-none focus:ring-2 focus:ring-matsu-primary/50 bg-white"
              placeholder="至少6个字符"
              required
              disabled={loading}
              minLength={6}
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-matsu-text mb-1">
            确认密码
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-matsu-text/40" />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-matsu-border rounded-lg focus:outline-none focus:ring-2 focus:ring-matsu-primary/50 bg-white"
              placeholder="再次输入密码"
              required
              disabled={loading}
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-matsu-primary hover:bg-matsu-primaryHover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '注册中...' : '注册'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-matsu-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-matsu-text/60">或使用第三方注册</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleOAuthSignUp('github')}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-matsu-border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium text-matsu-text">使用 GitHub 注册</span>
      </button>

      <div className="text-center text-sm text-matsu-text/60">
        已有账号？
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="ml-1 text-matsu-primary hover:text-matsu-primaryHover font-medium transition-colors"
          disabled={loading}
        >
          立即登录
        </button>
      </div>
    </div>
  )
}
