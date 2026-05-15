import { api } from '@/api/instance';
import { useRoomStore } from '@/stores/roomStore';
import type { Room } from '@/types/room';
import { Button, Dialog, TextInput } from '@vapor-ui/core';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CreateRoomModalProps {
  isOpen: boolean;
  onIsOpenChange: (isOpen: boolean) => void;
}

export default function CreateRoomModal({ isOpen, onIsOpenChange }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const { setRoom } = useRoomStore();
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    const res = await api.post<Room>('/rooms', { name: roomName });
    setRoom(res.data.id, res.data.myRole);
    onIsOpenChange(false);
    navigate(`/rooms/${res.data.id}`);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onIsOpenChange}>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>강의룸 생성</Dialog.Title>
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          <TextInput
            placeholder="강의 제목을 작성해주세요"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close render={<Button>취소</Button>} />
          <Button onClick={handleCreateRoom} disabled={!roomName.trim()}>
            생성
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
