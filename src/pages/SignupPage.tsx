import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  // 1. 입력값 상태 관리 (role 기본값 USER로 고정)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });

  // 2. 입력창 값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 3. 실시간 유효성 검사
  const { email, password, confirmPassword, nickname } = formData;

  const pwError = useMemo(() => {
    if (password.length > 0 && (password.length < 6 || password.length > 20)) {
      return '비밀번호는 6자 이상, 20자 이하로 입력해주세요.';
    }
    if (confirmPassword && password !== confirmPassword) {
      return '비밀번호가 일치하지 않습니다.';
    }
    return '';
  }, [password, confirmPassword]);

  const isBtnDisabled = useMemo(() => {
    const isEmailValid = email.includes('@');
    const isPwValid = password.length >= 6 && password.length <= 20;
    const isPwMatch = password === confirmPassword;
    const isNameValid = nickname.trim().length > 0;
    return !(isEmailValid && isPwValid && isPwMatch && isNameValid);
  }, [email, password, confirmPassword, nickname]);

  // 4. 가입 버튼 클릭 시 실행
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup({ email, password, nickname });
      alert('회원가입이 완료되었습니다.');
      navigate('/login');
    } catch {
      alert('회원가입에 실패했습니다.');
    }
  };

  // 5. 다크 모드 전용 포커스 이벤트 핸들러
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#3b82f6';
    e.target.style.backgroundColor = '#1e293b'; // 포커스 시에도 다크 톤 유지
    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.25)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#334155';
    e.target.style.backgroundColor = '#1e293b';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#111214', // 메인 페이지와 통일된 어두운 배경색
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        letterSpacing: '-0.02em',
      }}
    >
      <div
        className="p-6"
        style={{
          background: '#1a1b1e', // 카드 컴포넌트 다크 배경색
          width: '100%',
          maxWidth: '440px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          border: '1px solid #2a2b30',
          padding: '32px 24px',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            fontSize: '24px',
            fontWeight: '700',
            color: '#f8fafc',
          }}
        >
          회원가입
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* 이메일 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>
              이메일 계정
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* 비밀번호 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="6자리 이상 20자리 이하"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* 비밀번호 확인 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>
              비밀번호 확인
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 한번 더 입력"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {pwError && (
              <span
                style={{ color: '#f87171', fontSize: '12px', marginTop: '6px', fontWeight: '500' }}
              >
                {pwError}
              </span>
            )}
          </div>

          {/* 닉네임 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>닉네임</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="닉네임을 입력해주세요"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <button
            type="submit"
            disabled={isBtnDisabled}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isBtnDisabled ? '#2d3139' : '#2563eb',
              color: isBtnDisabled ? '#64748b' : '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isBtnDisabled ? 'not-allowed' : 'pointer',
              marginTop: '12px',
              transition: 'all 0.2s ease',
            }}
          >
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}

// 테마
const inputStyle: React.CSSProperties = {
  padding: '13px 16px',
  border: '1px solid #334155',
  borderRadius: '10px',
  fontSize: '15px',
  color: '#f8fafc',
  outline: 'none',
  backgroundColor: '#1e293b',
  transition: 'all 0.2s ease-in-out',
};
