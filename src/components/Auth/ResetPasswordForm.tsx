import React, { useState } from 'react'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useAuth, getAuthErrorMessage } from '../../contexts/AuthContext'
import { AuthError } from '@supabase/supabase-js'

interface ResetPasswordFormProps {
  onBack: () => void
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBack }) => {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(getAuthErrorMessage(err as AuthError))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-matsu-primary mb-2">邮件已发送</h2>
        <p className="text-matsu-text/60 mb-6">
          我们已向 <span className="font-medium text-matsu-text">{email}</span> 发送了重置密码的邮件。
          <br />
          请查收邮件并按照指引重置密码。
        </p>
        <button
          onClick={onBack}
          className="text-matsu-primary hover:text-matsu-primaryHover font-medium transition-colors"
        >
          返回登录
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-matsu-primary hover:text-matsu-primaryHover transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        返回登录
      </button>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-matsu-primary mb-2">重置密码</h2>
        <p className="text-matsu-text/60 text-sm">
          输入您的邮箱地址，我们将发送重置密码的链接
        </p>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-matsu-primary hover:bg-matsu-primaryHover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '发送中...' : '发送重置邮件'}
        </button>
      </form>
    </div>
  )
}
