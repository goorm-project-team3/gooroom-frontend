import React, { useState, useEffect } from 'react';

export function SignupPage() {
  // 1. 입력값 상태 관리 (기존 틀 유지 + role 추가)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    role: 'OWNER' // 강사: OWNER, 학생: USER 기본값 세팅
  });

  const [pwError, setPwError] = useState('');
  const [isBtnDisabled, setIsBtnDisabled] = useState(true);

  // 2. 입력창 값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. 실시간 유효성 검사 (비밀번호 일치 여부 및 버튼 활성화)
  useEffect(() => {
    const { email, password, confirmPassword, username } = formData;

    // 비밀번호 가이드라인 실시간 조건 (6자~20자 체크 기능 추가)
    if (password.length > 0 && (password.length < 6 || password.length > 20)) {
      setPwError('비밀번호는 6자 이상, 20자 이하로 입력해주세요.');
    } else if (confirmPassword && password !== confirmPassword) {
      setPwError('비밀번호가 일치하지 않습니다.');
    } else {
      setPwError('');
    }

    const isEmailValid = email.includes('@');
    const isPwValid = password.length >= 6 && password.length <= 20; // 8자에서 6~20자로 변경
    const isPwMatch = password === confirmPassword;
    const isNameValid = username.trim().length > 0;

    setIsBtnDisabled(!(isEmailValid && isPwValid && isPwMatch && isNameValid));
  }, [formData]);

  // 4. 가입 버튼 클릭 시 실행
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const signupData = {
      email: formData.email,
      password: formData.password,
      username: formData.username,
      role: formData.role // 백엔드로 역할 데이터 함께 전송
    };

    console.log('백엔드로 전송할 데이터:', signupData);
    alert('회원가입 요청 성공! (F12 콘솔창을 확인해보세요)');
  };

  return (
    // 전체 화면 중앙 정렬을 위한 스타일 wrapper
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh', 
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      letterSpacing: '-0.02em'
    }}>
      {/* 회원가입 카드 컨테이너 (트렌디 섀도우 및 라운드 적용) */}
      <div className="p-6" style={{ 
        background: '#ffffff', 
        width: '100%',
        maxWidth: '440px', 
        borderRadius: '16px', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)', 
        border: '1px solid #f1f5f9'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
          회원가입
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 이메일 입력 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>이메일 계정</label>
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

          {/* 비밀번호 입력 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="6자리 이상 20자리 이하로 입력해주세요"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* 비밀번호 확인 입력 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 한번 더 입력해주세요"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {pwError && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '500' }}>{pwError}</span>}
          </div>

          {/* 이름 입력 */}
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

          {/* [추가 항목] 원본 코딩 학원 IDE 콘셉트에 맞춘 역할 선택 라디오 영역 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>역할</label>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              padding: '14px', 
              backgroundColor: '#f8fafc', 
              borderRadius: '10px',
              border: '1px solid #cbd5e1'
            }}>
              {/* 강사 선택 */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="radio"
                  name="role"
                  value="OWNER"
                  checked={formData.role === 'OWNER'}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>강사 (OWNER)</span>
              </label>

              {/* 학생 선택 */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="radio"
                  name="role"
                  value="USER"
                  checked={formData.role === 'USER'}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>학생 (USER)</span>
              </label>
            </div>
          </div>

          {/* 가입 버튼 */}
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
              boxShadow: isBtnDisabled ? 'none' : '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}

// 포커스 시 은은한 링(Ring) 효과를 주기 위한 JS 스타일 제어 함수
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

// 공통 인풋 기본 스타일 정의
const inputStyle: React.CSSProperties = {
  padding: '13px 16px',
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  fontSize: '15px',
  color: '#334155',
  outline: 'none',
  backgroundColor: '#f8fafc',
  transition: 'all 0.2s ease-in-out'
};