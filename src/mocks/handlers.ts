import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/auth/login', async () => {
    return HttpResponse.json({ accessToken: 'mock-access-token' }, { status: 200 });
  }),
  http.post('/auth/signup', async () => {
    return HttpResponse.json({ message: 'signup success' }, { status: 201 });
  }),
  http.get('/rooms', async () => {
    return HttpResponse.json(
      {
        rooms: [
          { id: 'room-1', name: 'GooRoom Intro', myRole: 'OWNER', memberCount: 5 },
          { id: 'room-2', name: 'TypeScript Practice', myRole: 'USER', memberCount: 3 },
        ],
      },
      { status: 200 },
    );
  }),
  http.post('/rooms', async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json(
      { id: 'room-new', name: body.name, memberCount: 1, myRole: 'OWNER' },
      { status: 201 },
    );
  }),
  http.post('rooms/:id/join', async ({ params }) => {
    return HttpResponse.json({ id: params.id, myRole: 'USER' }, { status: 200 });
  }),
  http.get('/rooms/:id/files', async ({ params }) => {
    return HttpResponse.json(
      {
        roomId: params.id,
        files: [{ id: 'file-1', name: 'main.tsx' }],
      },
      { status: 200 },
    );
  }),
];
