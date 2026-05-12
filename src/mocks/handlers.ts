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
          { id: 'room-1', name: 'GooRoom Intro', owner: 'Instructor' },
          { id: 'room-2', name: 'TypeScript Practice', owner: 'Instructor' },
        ],
      },
      { status: 200 },
    );
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
