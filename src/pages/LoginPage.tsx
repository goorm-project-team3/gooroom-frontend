// src/pages/LoginPage.tsx

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { TextField } from '../components/common/TextField'
import { Button    } from '../components/common/Button'
import logo from '../assets/logo.png'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password })
      navigate('/rooms')       // 로그인 후 보여줄 페이지
    } catch (e) {
      // 에러는 useAuth.error 로 표시될 수도 있고, 여기서 catch 해도 됩니다.
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 왼쪽 이미지 혹은 로고 */}
      <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center">
        <img src={logo} alt="GooRoom로고" className="max-w-xs" />
      </div>

      {/* 오른쪽 로그인 폼 */}
      <div className="flex-1 flex flex-col justify-center p-8">
        <h1 className="text-3xl font-bold mb-6">GooRoom에 로그인</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <TextField
            label="이메일"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <TextField
            label="비밀번호"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-500 text-sm">
              {error.message || '로그인에 실패했습니다.'}
            </p>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? '로딩 중...' : '로그인'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          아직 계정이 없나요?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}