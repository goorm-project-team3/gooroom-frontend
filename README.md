# GooRoom Frontend

학습 특화 Web IDE **GooRoom**의 프론트엔드 프로젝트입니다.
강사(Owner)와 학생(User)이 실시간으로 코드를 공유하는 브라우저 기반 IDE를 목표로 합니다.

**배포 주소**: https://gooroom-frontend-gamma.vercel.app/

## 기술 스택

| 분류 | 라이브러리 |
|------|-----------|
| 프레임워크 | React 18 + TypeScript + Vite |
| 에디터 | @monaco-editor/react |
| 상태 관리 | Zustand v5 + TanStack Query v5 |
| 스타일 | Tailwind CSS v4 + @vapor-ui/core |
| 실시간 통신 | @stomp/stompjs (native WebSocket) |
| HTTP | axios |
| API 모킹 | MSW v2 |
| 라우팅 | react-router-dom v6 |
| 코드 품질 | ESLint + Prettier + TypeScript strict |

## 프로젝트 구조

```text
src/
├── api/                  # axios 인스턴스 및 API 함수
│   ├── instance.ts       # axios 기본 설정 (baseURL, 인터셉터)
│   ├── chat.ts
│   ├── note.ts
│   └── room.ts
├── components/
│   ├── common/           # 공통 컴포넌트 (Button, TextField, PrivateRoute)
│   └── room/
│       ├── chat/         # ChatInput, ChatMessages, ReactionBar, ReactionCard
│       ├── editor/       # MonacoEditor, EditorTabs, EditorBreadcrumb
│       ├── layout/       # ActivityBar, Sidebar, EditorArea, RightPanel, BottomPanel, RoomTopBar, StatusBar
│       └── sidebar/      # FileTree, MemberList, SearchPanel
├── hooks/                # 커스텀 훅
│   ├── useAuth.ts
│   ├── useChatSocket.ts          # 채팅 STOMP 구독/발행
│   ├── useChatHistory.ts         # 채팅 히스토리 조회 (React Query)
│   ├── useFileEditSocket.ts      # 파일 편집 OT 동기화
│   ├── useAwarenessSocket.ts     # 커서 공유 (OWNER → USER 단방향)
│   ├── useReactionSocket.ts      # 이모지 리액션
│   ├── useUnderstandingReactionSocket.ts  # 이해도 체크
│   ├── usePersonalNote.ts
│   └── useSharedNote.ts
├── mocks/                # MSW 핸들러
│   ├── browser.ts
│   └── handlers.ts
├── pages/                # 라우트 페이지
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── RoomListPage.tsx
│   └── RoomPage.tsx
├── stores/               # Zustand 전역 상태
│   ├── chatStore.ts
│   ├── editorStore.ts    # 열린 탭, 활성 파일
│   ├── fileTreeStore.ts  # 파일 트리 (Owner 로컬 Source of Truth)
│   ├── focusStore.ts     # 패널 포커스 상태
│   └── roomStore.ts      # 강의룸 입장 정보, myUserId
└── types/                # 공유 타입 정의
```

## 주요 기능

- **Monaco 에디터** — VS Code 기반 코드 편집, 구문 강조, 탭 관리
- **파일 트리** — 로컬 폴더/파일 업로드, 드래그&드롭 이동, 컨텍스트 메뉴
- **실시간 코드 동기화** — OT(Operational Transformation) 기반 버전 관리, Ctrl+S로 DB 저장
- **커서 공유** — 강사 커서를 학생 에디터에 실시간 표시
- **채팅** — STOMP 기반 실시간 채팅, Owner 메시지 강조
- **이모지 리액션** — 실시간 이모지 플로팅 애니메이션
- **이해도 체크** — 강사가 세션 시작/종료, 학생 투표, 카운트다운 프로그레스바
- **역할 기반 권한** — OWNER(강사) / USER(학생) 역할에 따른 UI/기능 분기

## 로컬 실행

```bash
npm install
```

`.env.local` 파일 생성:

```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
VITE_MSW_ENABLED=true   # BE 없이 MSW 모킹 사용 시
```

```bash
npm run dev
```

## 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `VITE_API_URL` | BE REST API 기본 URL | `http://localhost:8080` |
| `VITE_WS_URL` | WebSocket 연결 URL | `ws://localhost:8080/ws` |
| `VITE_MSW_ENABLED` | MSW 모킹 활성화 여부 | `true` / `false` |

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 포맷 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm run check` | format + typecheck + lint 일괄 실행 |

## 아키텍처 결정

### 상태 관리 분리
- **Zustand**: 서버와 무관한 클라이언트 전용 상태 (파일 트리, 에디터 탭, 포커스 등)
- **TanStack Query**: 서버 데이터 캐싱/동기화 (채팅 히스토리, 노트, 방 목록 등)

### WebSocket 인증
STOMP 헤더가 아닌 HTTP Upgrade 시점의 HttpOnly 쿠키로 인증합니다.
브라우저가 WebSocket Upgrade 요청에 쿠키를 자동 포함하므로 별도 토큰 전달이 불필요합니다.
SockJS는 Vite 프록시 호환 문제로 제거했으며, native WebSocket(`brokerURL`)을 사용합니다.

### 파일 트리 저장
파일명에 full path를 저장합니다 (`src/components/Button.tsx`).
폴더는 DB에 저장하지 않고 path 파싱으로 재구성합니다.

### MSW
BE 개발과 병행하기 위해 MSW로 API를 선행 모킹합니다.
`VITE_MSW_ENABLED=false`로 환경변수 하나만 바꾸면 실제 API로 전환됩니다.
