import { useMutation } from '@tanstack/react-query';
import axios from '../api/instance';
import { useRoomStore } from '@/stores/roomStore';

interface LoginPayload {
  email: string;
  password: string;
}
interface LoginResponse {
  userId: number;
  nickname: string;
}
interface SignupPayload {
  email: string;
  password: string;
  nickname: string;
}

export function useAuth() {
  const { setMyUserId, setMyNickname, clearUser } = useRoomStore();

  const {
    mutateAsync: login,
    status,
    error,
  } = useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (data) =>
      axios
        .post<{ success: boolean; data: LoginResponse }>('/api/auth/login', data)
        .then((res) => res.data.data),
    onSuccess: (data) => {
      setMyUserId(data.userId);
      setMyNickname(data.nickname);
    },
  });

  const { mutateAsync: signup } = useMutation<void, Error, SignupPayload>({
    mutationFn: (data) => axios.post('/api/auth/signup', data).then((res) => res.data),
  });

  const logout = async () => {
    await axios.post('/api/auth/logout');
    clearUser();
  };

  const isLoading = status === 'pending';

  return { login, isLoading, error, signup, logout };
}
