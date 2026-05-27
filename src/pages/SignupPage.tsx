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
    <div>
      <form onSubmit={handleSubmit}>
        <h1>회원가입</h1>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호 (최소 8자)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="닉네임 (2~20자)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit">회원가입</button>
        <Link to="/login">로그인으로 돌아가기</Link>
      </form>
    </div>
  );
}
