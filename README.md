# GooRoom Frontend

학습 특화 Web IDE **GooRoom**의 프론트엔드 프로젝트입니다.
강사(Owner)와 학생(User)이 실시간으로 코드를 공유하는 브라우저 기반 IDE를 목표로 합니다.

## 기술 스택

- React 18
- TypeScript (strict)
- Vite
- Tailwind CSS v3
- @vapor-ui/core (Vapor UI)
- @monaco-editor/react
- @tanstack/react-query v5
- zustand
- @stomp/stompjs + sockjs-client
- msw v2
- react-router-dom v6
- axios
- ESLint + Prettier

## 프로젝트 구조

```text
src/
├── api/
├── components/
│   ├── common/
│   ├── editor/
│   ├── layout/
│   └── room/
├── hooks/
├── mocks/
├── pages/
├── stores/
├── types/
└── utils/
```

## 로컬 실행

1. `npm install`
2. `.env.example`을 참고해 `.env.local` 파일 생성
3. `npm run dev`

## 환경변수

`.env.example`

```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
```
