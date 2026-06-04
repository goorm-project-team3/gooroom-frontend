import { fetchPersonalNote, updatePersonalNote } from '@/api/note';
import { useRoomStore } from '@/stores/roomStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function usePersonalNote() {
  const roomId = useRoomStore((s) => s.roomId);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['personalNote', roomId],
    queryFn: () => fetchPersonalNote(roomId!),
    enabled: !!roomId,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (content: string) => updatePersonalNote(roomId!, content),
    onSuccess: (data) => {
      queryClient.setQueryData(['personalNote', roomId], data);
    },
  });

  return { ...query, save: mutation.mutate, isSaving: mutation.isPending };
}
