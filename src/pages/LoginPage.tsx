// src/pages/LoginPage.tsx

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { TextField } from '../components/common/TextField'
import { Button } from '../components/common/Button'
import logo from '../assets/logo.png'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordValidationError, setPasswordValidationError] = useState('')

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    
    // 비밀번호 글자 수 유효성 검사 및 가이드 메시지
    if (value.length > 0 && (value.length < 6 || value.length > 20)) {
      setPasswordValidationError('비밀번호는 6자 이상, 20자 이하로 입력해주세요.')
    } else {
      setPasswordValidationError('')
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 최종 제출 시 한 번 더 검사
    if (password.length < 6 || password.length > 20) {
      setPasswordValidationError('비밀번호 글자 수를 다시 확인해주세요 (6~20자).')
      return
    }

    try {
      await login({ email, password })
      navigate('/rooms') // 로그인 후 보여줄 페이지
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* 왼쪽 이미지 혹은 로고 (화면이 줄어도 비율에 맞춰 유지됨) */}
      <div className="w-full md:w-1/2 bg-slate-50 flex items-center justify-center p-8 md:p-12">
        <img 
          src={logo} 
          alt="GooRoom로고" 
          className="w-full max-w-[150px] md:max-w-xs h-auto object-contain transition-all" 
        />
      </div>

      {/* 오른쪽 로그인 폼 */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-slate-800 tracking-tight">
            GooRoom에 로그인
          </h1>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              {/* 원래 컴포넌트 고유의 모양을 유지하도록 className 수정 항목 제거 */}
              <TextField
                label="이메일"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              {/* 원래 컴포넌트 고유의 모양을 유지하도록 className 수정 항목 제거 */}
              <TextField
                label="비밀번호"
                type="password"
                value={password}
                onChange={e => handlePasswordChange(e.target.value)}
                required
              />
              {/* 비밀번호 가이드 메시지 */}
              {passwordValidationError ? (
                <p className="text-amber-600 text-xs font-medium pl-1">
                  ⚠️ {passwordValidationError}
                </p>
              ) : (
                <p className="text-gray-400 text-xs pl-1">
                  비밀번호는 6자 이상 20자 이하로 입력해주세요.
                </p>
              )}
            </div>

            {/* 서버 에러 표시 */}
            {error && (
              <p className="text-red-500 text-sm pl-1 font-medium">
                {error.message || '로그인에 실패했습니다.'}
              </p>
            )}

            {/* 푸른색 계열의 예쁜 심플 상자 버튼 버튼 */}
            <Button 
              type="submit" 
              disabled={isLoading || !!passwordValidationError} 
              className="w-full py-3 px-4 bg-sky-400 hover:bg-sky-500 disabled:bg-slate-300 text-white font-semibold rounded-xl shadow-md shadow-sky-100 disabled:shadow-none transition-all duration-200 mt-2"
            >
              {isLoading ? '로딩 중...' : '로그인'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-500 text-center md:text-left">
            아직 계정이 없나요?{' '}
            <Link to="/signup" className="text-sky-500 font-medium hover:text-sky-600 hover:underline transition-all pl-1">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}