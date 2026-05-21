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
    const res = await api.post<{ id: string; userRole: 'USER'; name: string }>(
      `/rooms/${inviteCode}/join`,
    );
    setRoom(res.data.id, res.data.userRole);
    onIsOpenChange(false);
    navigate(`/rooms/${res.data.id}`);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onIsOpenChange}>
      <Dialog.Popup
        className="bg-bg-sidebar border border-border rounded-[12px] w-[420px] p-3 flex flex-col gap-[18px] shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
        overlayElement={
          <Dialog.OverlayPrimitive className="fixed inset-0 bg-black/65 backdrop-blur-[2px]" />
        }
      >
        <Dialog.Header className="flex items-center justify-between">
          <Dialog.Title className="text-base font-bold text-white">강의룸 참여</Dialog.Title>
          <Dialog.Close className="bg-transparent border-none text-text-dim text-[18px] w-7 h-7 rounded flex items-center justify-center hover:bg-bg-hover hover:text-text-primary transition-colors cursor-pointer" />
        </Dialog.Header>

        <Dialog.Body>
          <TextInput
            placeholder="초대 코드를 입력하세요"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full bg-bg-input border border-border rounded-md text-text-primary text-[13px] px-5 py-5 outline-none focus:border-accent-blue transition-colors"
          />
        </Dialog.Body>

        <Dialog.Footer className="flex justify-end gap-2">
          <Dialog.Close
            render={
              <Button className="bg-transparent border border-border text-text-primary text-[13px] px-5 py-2 rounded-md hover:bg-bg-hover transition-colors cursor-pointer">
                취소
              </Button>
            }
          />
          <Button
            onClick={handleJoinRoom}
            className="bg-accent-blue text-white text-[13px] font-semibold px-5 py-2 rounded-md hover:bg-[#1a8fe3] transition-colors cursor-pointer"
          >
            참여
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
