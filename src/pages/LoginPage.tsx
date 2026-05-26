import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/instance';
import { useRoomStore } from '@/stores/roomStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setMyUserId = useRoomStore((s) => s.setMyUserId);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      console.log('[Login] response data:', res.data); // 전체 응답 확인
      console.log('[Login] userId:', res.data.data?.userId); // userId 값 확인
      const userId = res.data.data.userId;
      setMyUserId(userId);
      navigate('/');
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-bg-base">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-80 p-8 bg-bg-panel rounded border border-border"
      >
        <h1 className="text-lg font-semibold text-text-primary">로그인</h1>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 bg-bg-input border border-border rounded text-text-primary text-sm outline-none focus:border-[#007acc]"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-3 py-2 bg-bg-input border border-border rounded text-text-primary text-sm outline-none focus:border-[#007acc]"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          className="py-2 bg-[#007acc] text-white rounded text-sm font-medium hover:bg-[#0069b3]"
        >
          로그인
        </button>
        <Link to="/signup" className="text-xs text-text-dim text-center hover:text-text-secondary">
          회원가입
        </Link>
      </form>
    </div>
  );
}
