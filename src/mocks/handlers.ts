import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/auth/login', async () => {
    return HttpResponse.json({ accessToken: 'mock-access-token' }, { status: 200 });
  }),
  http.post('/auth/signup', async () => {
    return HttpResponse.json({ message: 'signup success' }, { status: 201 });
  }),
  http.get('/auth/me', async () => {
    return HttpResponse.json({ id: 'user-1', name: 'Test User' }, { status: 200 });
  }),
  http.post('/api/rooms', async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      description: string;
      visibility: string;
    };
    return HttpResponse.json(
      {
        id: 999,
        name: body.name,
        description: body.description,
        visibility: body.visibility,
        userRole: 'OWNER',
        participantCount: 1,
        createdAt: '2026-05-21T00:00:00',
      },
      { status: 201 },
    );
  }),
  http.get('/api/rooms', async () => {
    return HttpResponse.json(
      [
        {
          id: 1,
          name: 'GooRoom Intro',
          description: 'GooRoom 사용법을 소개하는 강의입니다.',
          visibility: 'PUBLIC',
          userRole: 'OWNER',
          participantCount: 5,
          createdAt: '2026-05-21T00:00:00',
        },
        {
          id: 2,
          name: 'TypeScript Practice',
          description: 'TypeScript 기본 문법을 연습하는 강의입니다.',
          visibility: 'PRIVATE',
          userRole: 'USER',
          participantCount: 3,
          createdAt: '2026-05-21T00:00:00',
        },
      ],
      { status: 200 },
    );
  }),
  http.get('/api/rooms/:roomId/chat', () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          // BE가 Collections.reverse()로 ASC 변환 후 반환 — 오래된 메시지가 앞
          messages: [
            {
              messageId: 1,
              userId: 1,
              nickname: '김강사',
              content: '안녕하세요! 오늘 강의를 시작하겠습니다.',
              createdAt: '2026-05-24T14:00:00',
              role: 'OWNER',
            },
            {
              messageId: 2,
              userId: 3,
              nickname: '이학생',
              content: '안녕하세요!',
              createdAt: '2026-05-24T14:00:30',
              role: 'USER',
            },
            {
              messageId: 3,
              userId: 1,
              nickname: '김강사',
              content: '모두 접속 확인되시나요?',
              createdAt: '2026-05-24T14:01:00',
              role: 'OWNER',
            },
            {
              messageId: 4,
              userId: 2,
              nickname: '박학생',
              content: '잘 부탁드립니다!',
              createdAt: '2026-05-24T14:01:30',
              role: 'USER',
            },
            {
              messageId: 5,
              userId: 1,
              nickname: '김강사',
              content: '오늘은 TypeScript 기초부터 시작할게요.',
              createdAt: '2026-05-24T14:02:00',
              role: 'OWNER',
            },
          ],
          nextCursor: null,
          hasMore: false,
        },
      },
      { status: 200 },
    );
  }),
  http.get('/api/rooms/:roomId', ({ params }) => {
    return HttpResponse.json(
      {
        success: true,
        id: Number(params.roomId),
        data: {
          name: 'GooRoom Intro',
          userRole: 'OWNER',
        },
      },
      { status: 200 },
    );
  }),
  http.get('/api/rooms/:roomId/files', () => {
    return HttpResponse.json(
      [
        {
          id: 1,
          name: 'Main.java',
          language: 'java',
          content: null,
          createdBy: { id: 1, nickname: '김강사' },
          createdAt: '2026-05-28T00:00:00',
          updatedAt: '2026-05-28T00:00:00',
        },
        {
          id: 2,
          name: 'Solution.java',
          language: 'java',
          content: null,
          createdBy: { id: 1, nickname: '김강사' },
          createdAt: '2026-05-28T00:00:00',
          updatedAt: '2026-05-28T00:00:00',
        },
      ],
      { status: 200 },
    );
  }),
  http.get('/api/rooms/:roomId/files/:fileId', ({ params }) => {
    const fileId = Number(params.fileId);

    const mockContents: Record<number, string> = {
      1: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, GooRoom!");
    }
}`,
      2: `public class Solution {
    public int solve(int n) {
        return n * 2;
    }
}`,
    };

    return HttpResponse.json(
      {
        id: fileId,
        name: fileId === 1 ? 'Main.java' : 'Solution.java',
        language: 'java',
        content: mockContents[fileId] ?? '',
        createdBy: { id: 1, nickname: '김강사' },
        createdAt: '2026-05-28T00:00:00',
        updatedAt: '2026-05-28T00:00:00',
      },
      { status: 200 },
    );
  }),
  http.post('/api/rooms/:roomId/files', async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      language: string | null;
      content: string;
    };
    return HttpResponse.json(
      {
        id: Date.now(), // 임시 ID
        name: body.name,
        language: body.language,
        content: body.content,
        createdBy: { id: 1, nickname: '김강사' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),
  http.delete('/api/rooms/:roomId/files/:fileId', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
