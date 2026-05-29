// src/components/layout/Header.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Header() {
  const navigate = useNavigate()
  const { login, isLoading: isLoggingOut, } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
      alert('로그아웃에 실패했습니다.')
    }
  }

  return (
    <header className="p-4 bg-white shadow flex justify-between">
      <h1 className="font-bold">GooRoom</h1>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
      >
        {isLoggingOut ? '...' : '로그아웃'}
      </button>
    </header>
  )
}