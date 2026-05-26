import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/instance';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/auth/signup', { email, password, nickname });
      navigate('/login');
    } catch {
      setError('회원가입에 실패했습니다. 입력값을 확인해주세요.');
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-bg-base">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-80 p-8 bg-bg-panel rounded border border-border"
      >
        <h1 className="text-lg font-semibold text-text-primary">회원가입</h1>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 bg-bg-input border border-border rounded text-text-primary text-sm outline-none focus:border-[#007acc]"
        />
        <input
          type="password"
          placeholder="비밀번호 (최소 8자)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-3 py-2 bg-bg-input border border-border rounded text-text-primary text-sm outline-none focus:border-[#007acc]"
        />
        <input
          type="text"
          placeholder="닉네임 (2~20자)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="px-3 py-2 bg-bg-input border border-border rounded text-text-primary text-sm outline-none focus:border-[#007acc]"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          className="py-2 bg-[#007acc] text-white rounded text-sm font-medium hover:bg-[#0069b3]"
        >
          회원가입
        </button>
        <Link to="/login" className="text-xs text-text-dim text-center hover:text-text-secondary">
          로그인으로 돌아가기
        </Link>
      </form>
    </div>
  );
}
