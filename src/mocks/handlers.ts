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
];
