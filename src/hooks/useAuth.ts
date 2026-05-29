// src/hooks/useAuth.ts

import { useMutation } from '@tanstack/react-query'
import axios from '../api/instance'

interface LoginPayload { email: string; password: string }
interface LoginResponse { token: string }

export function useAuth() {
  const { mutateAsync: login, status, error } = useMutation<LoginResponse, Error, LoginPayload>(
    {
      mutationFn: (data: LoginPayload) =>
        axios.post<LoginResponse>('/auth/login', data).then(res => res.data),
      onSuccess: (data) => {
        localStorage.setItem('ACCESS_TOKEN', data.token)
        // 혹은 Zustand / Context 에 로그인 상태 저장
      }
    }
  )

  const isLoading = status === 'pending'

  return { login, isLoading, error , logout: async () => {
   } }
}