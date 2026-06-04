import { api } from './instance';

export const deleteRoom = async (roomId: number): Promise<void> => {
  await api.delete(`/api/rooms/${roomId}`);
};
