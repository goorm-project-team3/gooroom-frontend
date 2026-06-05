// src/pages/LoginPage.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TextField } from '../components/common/TextField';
import { Button } from '../components/common/Button';
import logo from '../assets/logo.png';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordValidationError, setPasswordValidationError] = useState('');

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.length > 0 && (value.length < 6 || value.length > 20)) {
      setPasswordValidationError('비밀번호는 6자 이상, 20자 이하로 입력해주세요.');
    } else {
      setPasswordValidationError('');
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6 || password.length > 20) {
      setPasswordValidationError('비밀번호 글자 수를 다시 확인해주세요 (6~20자).');
      return;
    }
    try {
      await login({ email, password });
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    // 🌟 min-h-screen & overflow-hidden으로 스크롤바 원천 차단
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-[#0b0c10]">
      
      {/* 왼쪽 이미지: 부모 높이(h-full)를 넘지 않도록 설정 */}
      <div className="hidden md:flex w-1/2 h-full items-center justify-center bg-black overflow-hidden">
        <img
          src={logo}
          alt="GooRoom로고"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 오른쪽 로그인 폼: 높이를 100%로 채우고 내부만 스크롤되게 설정 */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center p-8 lg:p-16 overflow-y-auto">
        <div className="max-w-md w-full mx-auto" style={{ color: '#ffffff' }}>
          <h1 className="text-3xl font-bold mb-8 tracking-tight text-white">
            GooRoom에 로그인
          </h1>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="[&_input]:!text-white [&_input]:!bg-[#1f2833] [&_input]:!border-[#45f3ff] [&_label]:!text-gray-300">
              <TextField
                label="이메일"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <div className="[&_input]:!text-white [&_input]:!bg-[#1f2833] [&_input]:!border-[#45f3ff] [&_label]:!text-gray-300">
                <TextField
                  label="비밀번호"
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                />
              </div>
              {passwordValidationError ? (
                <p className="text-red-400 text-xs font-medium pl-1">
                  ⚠️ {passwordValidationError}
                </p>
              ) : (
                <p className="text-gray-400 text-xs pl-1">
                  비밀번호는 6자 이상 20자 이하로 입력해주세요.
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-400 text-sm pl-1 font-medium">
                {error.message || '로그인에 실패했습니다.'}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading || !!passwordValidationError}
              className="w-full py-3 px-4 font-semibold rounded-xl transition-all duration-200 mt-2"
              style={{
                backgroundColor: isLoading || !!passwordValidationError ? '#334155' : '#45f3ff',
                color: '#000000'
              }}
            >
              {isLoading ? '로딩 중...' : '로그인'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-center md:text-left text-gray-400">
            아직 계정이 없나요?{' '}
            <Link
              to="/signup"
              className="font-medium hover:underline pl-1"
              style={{ color: '#45f3ff' }}
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}