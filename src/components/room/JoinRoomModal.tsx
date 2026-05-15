import { api } from '@/api/instance';
import { useRoomStore } from '@/stores/roomStore';
import { Button, Dialog, TextInput } from '@vapor-ui/core';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface JoinRoomModalProps {
  isOpen: boolean;
  onIsOpenChange: (isOpen: boolean) => void;
}

export default function JoinRoomModal({ isOpen, onIsOpenChange }: JoinRoomModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const { setRoom } = useRoomStore();
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    const res = await api.post<{ id: string; myRole: 'USER' }>(`/rooms/${inviteCode}/join`);
    setRoom(res.data.id, res.data.myRole);
    onIsOpenChange(false);
    navigate(`/rooms/${res.data.id}`);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onIsOpenChange}>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>강의 참여</Dialog.Title>
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          <TextInput
            placeholder="초대 코드를 입력하세요"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close render={<Button>취소</Button>} />
          <Button onClick={handleJoinRoom}>참여</Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
