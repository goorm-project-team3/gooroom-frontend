import React, { useState, useMemo } from 'react';

export function SignupPage() {
  // 1. 입력값 상태 관리 (원본 유지)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    role: 'OWNER',
  });

  // 2. 입력창 값 변경 핸들러 (원본 유지)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 3. 실시간 유효성 검사 (원본 유지: 6자~20자 체크)
  const { email, password, confirmPassword, username } = formData;

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
    const isNameValid = username.trim().length > 0;
    return !(isEmailValid && isPwValid && isPwMatch && isNameValid);
  }, [email, password, confirmPassword, username]);

  // 4. 가입 버튼 클릭 시 실행 (원본 유지)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const signupData = { ...formData };
    console.log('백엔드로 전송할 데이터:', signupData);
    alert('회원가입 요청 성공!');
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        letterSpacing: '-0.02em',
      }}
    >
      <div
        className="p-6"
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '440px',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            fontSize: '24px',
            fontWeight: '700',
            color: '#0f172a',
          }}
        >
          회원가입
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* 이메일 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
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
                style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '500' }}
              >
                {pwError}
              </span>
            )}
          </div>

          {/* 이름 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>이름</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="홍길동"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* 역할 선택 - 이 부분을 시각적으로 잘 보이게 수정했습니다 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>역할</label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
              }}
            >
              {/* 강사 선택 영역 */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'background 0.2s',
                  backgroundColor: formData.role === 'OWNER' ? '#eff6ff' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="OWNER"
                  checked={formData.role === 'OWNER'}
                  onChange={handleChange}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#2563eb', // 파란색 점이 보이도록 설정
                    appearance: 'auto', // 브라우저 기본 라디오 버튼 점 강제 노출
                  }}
                />
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: formData.role === 'OWNER' ? '700' : '500',
                    color: formData.role === 'OWNER' ? '#1e40af' : '#334155',
                  }}
                >
                  강사 (OWNER)
                </span>
              </label>

              {/* 학생 선택 영역 */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'background 0.2s',
                  backgroundColor: formData.role === 'USER' ? '#eff6ff' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="USER"
                  checked={formData.role === 'USER'}
                  onChange={handleChange}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#2563eb', // 파란색 점이 보이도록 설정
                    appearance: 'auto', // 브라우저 기본 라디오 버튼 점 강제 노출
                  }}
                />
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: formData.role === 'USER' ? '700' : '500',
                    color: formData.role === 'USER' ? '#1e40af' : '#334155',
                  }}
                >
                  학생 (USER)
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isBtnDisabled}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isBtnDisabled ? '#e2e8f0' : '#2563eb',
              color: isBtnDisabled ? '#94a3b8' : '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isBtnDisabled ? 'not-allowed' : 'pointer',
              marginTop: '8px',
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

// 헬퍼 함수들 (원본 유지)
const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = '#3b82f6';
  e.target.style.backgroundColor = '#ffffff';
  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.15)';
};

const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = '#cbd5e1';
  e.target.style.backgroundColor = '#f8fafc';
  e.target.style.boxShadow = 'none';
};

const inputStyle: React.CSSProperties = {
  padding: '13px 16px',
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  fontSize: '15px',
  color: '#334155',
  outline: 'none',
  backgroundColor: '#f8fafc',
  transition: 'all 0.2s ease-in-out',
};
