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
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const { setRoom } = useRoomStore();
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    const res = await api.post<Room>('/api/rooms', { name: roomName, description, visibility });
    setRoom(String(res.data.id), res.data.name, res.data.userRole);
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
          <Dialog.Title className="text-base font-bold text-white">강의룸 만들기</Dialog.Title>
          <Dialog.Close className="bg-transparent border-none text-text-dim text-[18px] w-7 h-7 rounded flex items-center justify-center hover:bg-bg-hover hover:text-text-primary transition-colors cursor-pointer" />
        </Dialog.Header>

        <Dialog.Body className="flex flex-col gap-3">
          <TextInput
            placeholder="강의룸 이름을 입력하세요"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full bg-bg-input border border-border rounded-md text-text-primary text-[13px] px-5 py-5 outline-none focus:border-accent-blue transition-colors"
          />
          <TextInput
            placeholder="강의룸 설명을 입력하세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-bg-input border border-border rounded-md text-text-primary text-[13px] px-5 py-5 outline-none focus:border-accent-blue transition-colors"
          />
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-text-dim">공개 여부</span>
            <div className="flex rounded-md overflow-hidden border border-border">
              <button
                type="button"
                className={`text-[12px] px-3 py-1 transition-colors ${visibility === 'PUBLIC' ? 'bg-accent-blue text-white' : 'bg-bg-input text-text-dim hover:bg-bg-hover'}`}
                onClick={() => setVisibility('PUBLIC')}
              >
                PUBLIC
              </button>
              <button
                type="button"
                className={`text-[12px] px-3 py-1 transition-colors ${visibility === 'PRIVATE' ? 'bg-accent-blue text-white' : 'bg-bg-input text-text-dim hover:bg-bg-hover'}`}
                onClick={() => setVisibility('PRIVATE')}
              >
                PRIVATE
              </button>
            </div>
          </div>
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
            onClick={handleCreateRoom}
            className="bg-accent-blue text-white text-[13px] font-semibold px-5 py-2 rounded-md hover:bg-[#1a8fe3] transition-colors cursor-pointer"
          >
            만들기
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
