# RoomPage 전체 구현 계획

## 개요

강의룸(RoomPage)은 강사(OWNER)와 학생(USER)이 실시간으로 코드를 공유하는 Web IDE의 핵심 페이지다.
구현은 크게 **4단계**로 나뉜다.

- **Phase 1**: 레이아웃 및 정적 UI
- **Phase 2**: 에디터 + 파일 시스템 연동
- **Phase 3**: 채팅 + 이해도 반응
- **Phase 4**: WebSocket 실시간 연동

각 Phase는 이전 Phase 완료 후 진행한다.
Phase 4를 제외한 모든 단계는 MSW 목업으로 동작 가능하다.

---

## Phase 1 — 레이아웃 및 정적 UI

### 목표
RoomPage의 전체 골격을 완성한다. 데이터 연동 없이 하드코딩된 값으로 각 영역의 UI를 구현한다.

### 전체 레이아웃 구조

```
┌─────────────────────────────────────────────────┐
│                   TopBar (44px)                  │
├──────┬────────┬──────────────────┬───────────────┤
│      │        │                  │               │
│ Act  │Sidebar │   EditorArea     │  RightPanel   │
│ ivity│(240px) │   (flex: 1)      │   (280px)     │
│  Bar │        │                  │               │
│(52px)│        │                  │               │
├──────┴────────┴──────────────────┴───────────────┤
│                  BottomPanel (가변)               │
├─────────────────────────────────────────────────┤
│                  StatusBar (28px)                │
└─────────────────────────────────────────────────┘
```

### 파일 구조

```
src/
├── pages/
│   └── RoomPage.tsx                   # 레이아웃 조립만 담당
└── components/
    └── room/
        ├── layout/
        │   ├── RoomTopBar.tsx
        │   ├── ActivityBar.tsx
        │   ├── Sidebar.tsx
        │   ├── EditorArea.tsx
        │   ├── RightPanel.tsx
        │   ├── BottomPanel.tsx
        │   └── StatusBar.tsx
        ├── sidebar/
        │   ├── FileTree.tsx
        │   └── MemberList.tsx
        ├── editor/
        │   ├── EditorTabs.tsx
        │   └── MonacoEditor.tsx
        └── chat/
            ├── ReactionCard.tsx
            ├── ChatMessages.tsx
            ├── ReactionBar.tsx
            └── ChatInput.tsx
```

### 각 영역 상세

#### RoomTopBar
- 높이: `44px`
- 좌측: 룸 이름 (작은 폰트, `text-text-secondary`)
- 우측 (왼쪽부터): 멤버 아바타 스택 → 포커스 토글 버튼 → 설정 아이콘
- 멤버 아바타: 최대 4개 표시, 초과 시 `+N` 뱃지. 색상은 멤버 id 기반 팔레트에서 결정
- 포커스 토글:
  - OWNER: 클릭 가능 버튼 (`focusStore.toggleFocusMode`)
  - USER: 현재 포커스 상태만 표시 (읽기 전용)

#### ActivityBar
- 너비: `52px`
- 탐색기 / 멤버 아이콘 버튼 (상단), 설정 아이콘 (하단 고정)
- 로컬 상태 `activeSidebar: 'explorer' | 'members' | null`
- 같은 항목 재클릭 시 사이드바 닫힘 (토글)
- 활성 항목: 좌측 선 강조 또는 배경색 변경

#### Sidebar
- 너비: `240px`
- `activeSidebar` 값에 따라 `FileTree` 또는 `MemberList` 렌더링
- 헤더 텍스트도 함께 전환: `탐색기` / `멤버`
- `activeSidebar === null`이면 Sidebar 자체를 숨김 (너비 0)

**FileTree** (Phase 1에서는 하드코딩)
- 폴더/파일 트리 구조 표시
- 현재 `activeFileId`와 일치하는 항목 강조
- 파일 클릭 시 `editorStore.setActiveFile(fileId)` 호출

**MemberList** (Phase 1에서는 하드코딩)
- 멤버 아바타 + 이름 + 역할/온라인 상태 표시
- OWNER는 별도 뱃지 또는 색상으로 구분
- 온라인/오프라인 상태 표시

#### EditorArea
- `flex: 1`, 최소 너비 0
- 상단: `EditorTabs`
- 하단: `MonacoEditor`

**EditorTabs**
- `editorStore.openedFiles` 순회하여 탭 렌더링
- `activeFileId` 탭에 활성 스타일 (하단 border `accent-blue`)
- ✕ 클릭 시 해당 파일 탭 제거 → `editorStore.closeFile(fileId)` 필요 (아래 Store 변경 참고)

**MonacoEditor**
```tsx
<Editor
  height="100%"
  language="typescript"
  theme="vs-dark"
  value={fileContent}
  options={{
    fontSize: 13,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontFamily: "'JetBrains Mono', monospace",
    lineNumbers: 'on',
    renderLineHighlight: 'line',
    tabSize: 2,
  }}
/>
```
Phase 1에서는 `value`를 하드코딩된 문자열로 설정.

#### RightPanel
- 너비: `280px`
- 헤더: `채팅` 레이블
- 내부 구성 (위에서 아래):
  1. `ReactionCard` (float, 조건부 표시 — Phase 3에서 구현)
  2. `ChatMessages` (스크롤 가능)
  3. `ReactionBar` (이모지 반응 버튼 6개)
  4. `ChatInput` (입력창 + 전송 버튼)

Phase 1에서는 ReactionCard 없이 나머지 정적 UI만 구현.

#### BottomPanel
- 높이: 기본 `200px`, 드래그 리사이즈 가능 (최소 `120px`, 최대 `420px`)
- 상단: resize handle (`4px`, `cursor: row-resize`)
- 헤더: `강의 노트`
- 내용:
  - 좌측: 노트 목록
  - 우측: 노트 작성 textarea + 추가 버튼

resize 로직: `useRef` + `mousedown/mousemove/mouseup` 이벤트로 패널 높이 조절.

#### StatusBar
- 높이: `28px`
- 좌측: WS 연결 상태 / 현재 role / 포커스 모드 상태
- 우측: 인코딩(`UTF-8`) / 언어(파일 확장자 기반) / 커서 위치
- Phase 1에서는 모두 하드코딩. 커서 위치는 Phase 2에서 Monaco 이벤트로 연동.

### Phase 1 완료 기준
- [ ] 전체 레이아웃 5영역이 올바르게 배치됨
- [ ] ActivityBar 클릭으로 Sidebar 전환 동작
- [ ] Sidebar 토글(열기/닫기) 동작
- [ ] EditorTabs 정적 렌더링
- [ ] Monaco 에디터 기본 렌더링 (하드코딩 값)
- [ ] BottomPanel resize 드래그 동작
- [ ] 포커스 토글 버튼 UI 및 `focusStore` 연결

---

## Phase 2 — 에디터 + 파일 시스템 연동

### 목표
파일 트리와 에디터를 실제 API와 연결한다. 파일 선택 → 내용 로드 → 에디터 표시 흐름을 완성한다.

### Store 변경사항

**editorStore.ts 추가**
```ts
// 추가할 타입
interface FileContent {
  [fileId: string]: string;
}

// 추가할 필드
fileContents: FileContent;

// 추가할 액션
closeFile: (fileId: string) => void;
setFileContent: (fileId: string, content: string) => void;
```

`closeFile` 로직:
- `openedFiles`에서 해당 fileId 제거
- `activeFileId`가 닫힌 파일이면 직전 탭으로 이동, 없으면 `null`

**roomStore.ts 추가**
```ts
// 추가할 액션
setMembers: (members: RoomMember[]) => void;
```

### API 연동

| 메서드 | 경로 | 용도 |
|---|---|---|
| `GET` | `/rooms/:id` | 룸 상세 (이름, 내 role) |
| `GET` | `/rooms/:id/files` | 파일 목록 (이미 MSW 있음) |
| `GET` | `/rooms/:id/files/:fileId` | 파일 내용 |
| `GET` | `/rooms/:id/members` | 멤버 목록 |

### MSW 핸들러 추가 목록

```ts
// 룸 상세
http.get('/rooms/:id', ...)
// 파일 내용
http.get('/rooms/:id/files/:fileId', () =>
  HttpResponse.json({ id: 'file-1', name: 'main.tsx', content: '// 코드 내용' })
)
// 멤버 목록
http.get('/rooms/:id/members', () =>
  HttpResponse.json({
    members: [
      { id: 'user-1', name: '김강사', role: 'OWNER' },
      { id: 'user-2', name: '박학생', role: 'USER' },
    ]
  })
)
```

### 파일 선택 → 에디터 흐름

1. `FileTree`에서 파일 클릭
2. `editorStore.setActiveFile(fileId)` 호출
3. `MonacoEditor`에서 `activeFileId` 감지
4. `fileContents[activeFileId]`가 없으면 `GET /rooms/:id/files/:fileId` 요청
5. 응답 content를 `editorStore.setFileContent`로 저장
6. 에디터 `value` 업데이트

### StatusBar Monaco 연동

```tsx
// MonacoEditor에서 커서 위치 이벤트
editor.onDidChangeCursorPosition((e) => {
  const { lineNumber, column } = e.position;
  // 부모로 전달 or 별도 상태로 관리
});
```

언어 감지: `activeFileId`에 해당하는 파일명 확장자로 Monaco `language` prop 결정.
```ts
const langMap: Record<string, string> = {
  tsx: 'typescript',
  ts: 'typescript',
  jsx: 'javascript',
  js: 'javascript',
  css: 'css',
  html: 'html',
  json: 'json',
};
```

### Phase 2 완료 기준
- [ ] 파일 클릭 → 탭 추가 → 에디터에 내용 표시
- [ ] 탭 ✕ 클릭으로 파일 닫기, 이전 탭으로 포커스 이동
- [ ] 멤버 목록 API 연동
- [ ] StatusBar 커서 위치 실시간 반영
- [ ] StatusBar 언어 표시 파일 확장자 기반으로 동작

---

## Phase 3 — 채팅 + 이해도 반응

### 목표
채팅 기능과 이해도 반응 투표 기능을 구현한다.
WebSocket 연동 전이므로 MSW + 로컬 상태로 동작한다.

### 이해도 반응 상태 설계

**roomStore.ts 추가**
```ts
// 반응 타입
type ReactionType = 'understood' | 'confused';

interface ReactionCounts {
  understood: number;
  confused: number;
}

// 추가할 필드
isReactionOpen: boolean;
reactionCounts: ReactionCounts;
myReaction: ReactionType | null;

// 추가할 액션
openReaction: () => void;
closeReaction: () => void;
resetReaction: () => void;
submitReaction: (reaction: ReactionType) => void;
```

### ReactionCard UI

**OWNER 뷰 (항상 표시)**
```
┌──────────────────────────────┐
│ 이해도 현황           [초기화] │
│                              │
│  이해했어요  12명  ████████░░ │
│  잘모르겠어요  4명  ███░░░░░░ │
│                              │
│       [투표 열기 / 투표 닫기]  │
└──────────────────────────────┘
```
- 진행률 바: `count / total * 100%`
- total이 0이면 진행률 바 미표시
- "초기화": `resetReaction()` 호출, counts 및 `myReaction` 초기화
- "투표 열기/닫기": `openReaction()` / `closeReaction()` 토글

**USER 뷰 (isReactionOpen일 때만 슬라이드 다운)**

미선택:
```
┌──────────────────────────────┐
│ 이해도 반응                   │
│  [이해했어요]  [잘 모르겠어요] │
└──────────────────────────────┘
```

선택 후:
```
┌──────────────────────────────┐
│ 이해도 반응          [변경하기]│
│  이해했어요 선택됨             │
└──────────────────────────────┘
```

- 선택 후 카드 유지 (자동으로 닫히지 않음)
- "변경하기": 미선택 상태로 되돌림
- OWNER가 `closeReaction()` 호출 시 카드 자동 사라짐

### 슬라이드 애니메이션

```tsx
// RightPanel 내부 구조
<div className="flex flex-col flex-1 overflow-hidden relative">

  {/* ReactionCard: 채팅 위에 absolute float */}
  <div
    className={`
      absolute top-0 left-0 right-0 z-10 p-2
      transition-all duration-300 ease-in-out
      ${showReactionCard
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 -translate-y-2 pointer-events-none'}
    `}
  >
    <ReactionCard />
  </div>

  {/* 채팅: 레이아웃 변화 없음 */}
  <ChatMessages />
</div>
```

`showReactionCard` 조건:
- `role === 'OWNER'`: 항상 `true`
- `role === 'USER'`: `isReactionOpen === true`

### 채팅 기능

**ChatMessages**
- 메시지 목록 스크롤
- 새 메시지 수신 시 자동 스크롤: `useRef` + `scrollIntoView`
- 메시지 항목: 발신자명 + 내용 + 시각

**ChatInput**
- `Enter` 키 전송 (`Shift+Enter`는 줄바꿈)
- 전송 후 입력창 초기화

**ReactionBar**
- 이모지 버튼 6개: 👍 ❤️ 🎉 🤔 😮 👏
- 클릭 시 채팅 메시지로 전송 (텍스트와 동일하게 처리)

### MSW 핸들러 추가 목록

```ts
// 채팅 메시지 목록
http.get('/rooms/:id/messages', ...)
// 메시지 전송
http.post('/rooms/:id/messages', ...)
// 이해도 반응 상태 조회
http.get('/rooms/:id/reaction', ...)
// 투표 열기
http.post('/rooms/:id/reaction/open', ...)
// 투표 닫기
http.post('/rooms/:id/reaction/close', ...)
// 투표 초기화
http.post('/rooms/:id/reaction/reset', ...)
// 반응 제출
http.post('/rooms/:id/reaction', ...) // body: { type: 'understood' | 'confused' }
```

### Phase 3 완료 기준
- [ ] 채팅 메시지 목록 표시 및 스크롤
- [ ] 채팅 입력/전송 동작 (Enter 키 포함)
- [ ] 이모지 반응 버튼 클릭 시 메시지 전송
- [ ] OWNER: ReactionCard 항상 표시, 투표 열기/닫기/초기화 동작
- [ ] USER: `isReactionOpen` 시 ReactionCard 슬라이드 다운 애니메이션
- [ ] USER: 반응 선택 및 변경 동작
- [ ] OWNER: 실시간 집계 현황 표시 (Phase 3에서는 로컬 상태 기반)

---

## Phase 4 — WebSocket 실시간 연동

### 목표
`@stomp/stompjs` + `sockjs-client`로 WebSocket을 연결하고, 실시간 기능을 완성한다.

### 연결 관리

커스텀 훅 `useRoomSocket(roomId)` 를 `RoomPage`에서 호출.
연결/해제는 컴포넌트 마운트/언마운트에 맞춤.

```ts
// hooks/useRoomSocket.ts
// 구독할 토픽 목록 (예시)
/topic/room/{roomId}/chat        // 채팅 메시지
/topic/room/{roomId}/reaction    // 이해도 반응 상태 변경
/topic/room/{roomId}/editor      // 에디터 변경 사항 (포커스 모드)
/topic/room/{roomId}/members     // 멤버 입장/퇴장
```

### StatusBar WS 상태

WebSocket 연결 상태를 `useState`로 관리하여 StatusBar에 반영.
- 연결됨: `● WS Connected` (`text-accent-green`)
- 끊김: `○ WS Disconnected` (`text-accent-red`)

### 실시간 채팅

- 메시지 전송: REST `POST /rooms/:id/messages` 또는 STOMP publish
- 메시지 수신: `/topic/room/{roomId}/chat` 구독 → `ChatMessages` 상태 업데이트

### 실시간 이해도 반응

- OWNER가 투표 열기/닫기/초기화 → STOMP publish
- `/topic/room/{roomId}/reaction` 구독 → 모든 클라이언트 `isReactionOpen`, `reactionCounts` 동기화
- USER가 반응 제출 → STOMP publish → OWNER 화면 카운트 실시간 업데이트

### 포커스 모드 (에디터 동기화)

- OWNER가 포커스 모드 ON → STOMP publish
- `/topic/room/{roomId}/editor` 구독:
  - USER: 에디터 `readOnly: true` 설정, OWNER의 현재 파일/커서로 이동
  - OWNER 커서 위치 변경 이벤트 → STOMP publish → USER 에디터에 decoration으로 표시

### 멤버 입장/퇴장

- `/topic/room/{roomId}/members` 구독 → `roomStore.setMembers()` 업데이트
- TopBar 아바타 스택, MemberList 실시간 반영

### Phase 4 완료 기준
- [ ] WebSocket 연결/해제 및 StatusBar 상태 반영
- [ ] 채팅 실시간 송수신
- [ ] 이해도 반응 투표 상태 실시간 동기화
- [ ] 포커스 모드 ON/OFF 실시간 동기화
- [ ] 포커스 모드 시 USER 에디터 OWNER 커서 추적
- [ ] 멤버 입장/퇴장 실시간 반영

---

## 전체 진행 순서 요약

| Phase | 핵심 작업 | 의존성 |
|---|---|---|
| **Phase 1** | 레이아웃 / 정적 UI / resize / focusStore 연결 | 없음 |
| **Phase 2** | 파일 API 연동 / Monaco 에디터 / editorStore 완성 | Phase 1 |
| **Phase 3** | 채팅 UI / 이해도 반응 (로컬 상태) | Phase 1 |
| **Phase 4** | WebSocket 실시간 연동 전체 | Phase 2, 3 |

> Phase 2와 Phase 3은 서로 의존성이 없으므로 병렬 작업 가능.
