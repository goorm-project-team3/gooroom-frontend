import { fetchSharedNote, updateSharedNote } from '@/api/note';
import { useRoomStore } from '@/stores/roomStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useSharedNote() {
  const roomId = useRoomStore((s) => s.roomId);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sharedNote', roomId],
    queryFn: () => fetchSharedNote(roomId!),
    enabled: !!roomId,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (content: string) => updateSharedNote(roomId!, content),
    onSuccess: (data) => {
      queryClient.setQueryData(['sharedNote', roomId], data);
    },
  });

  return { ...query, save: mutation.mutate, isSaving: mutation.isPending };
}
