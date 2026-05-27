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
    <div>
      <form onSubmit={handleSubmit}>
        <h1>로그인</h1>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit">로그인</button>
        <Link to="/signup">회원가입</Link>
      </form>
    </div>
  );
}
