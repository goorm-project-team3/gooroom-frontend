import { api } from './instance';
import type { SharedNoteResponse, PersonalNoteResponse } from '@/types/note';

export const fetchSharedNote = async (roomId: string): Promise<SharedNoteResponse> => {
  const { data } = await api.get(`/api/rooms/${roomId}/notes/shared`);
  return data;
};

export const updateSharedNote = async (
  roomId: string,
  content: string,
): Promise<SharedNoteResponse> => {
  const { data } = await api.patch(`/api/rooms/${roomId}/notes/shared`, { content });
  return data;
};

export const fetchPersonalNote = async (roomId: string): Promise<PersonalNoteResponse> => {
  const { data } = await api.get(`/api/rooms/${roomId}/notes/personal`);
  return data;
};

export const updatePersonalNote = async (
  roomId: string,
  content: string,
): Promise<PersonalNoteResponse> => {
  const { data } = await api.patch(`/api/rooms/${roomId}/notes/personal`, { content });
  return data;
};
