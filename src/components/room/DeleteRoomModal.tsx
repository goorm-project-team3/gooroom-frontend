interface DeleteRoomModalProps {
  isOpen: boolean;
  onIsOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

export default function DeleteRoomModal({
  isOpen,
  onIsOpenChange,
  onConfirm,
}: DeleteRoomModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-room-title"
      aria-describedby="delete-room-desc"
    >
      <div className="bg-bg-panel border border-border rounded p-6 flex flex-col gap-4 w-72">
        <p id="delete-room-title" className="text-text-primary text-sm">
          정말 해당 강의룸을 삭제하시겠습니까?
        </p>
        <p id="delete-room-desc" className="text-text-dim text-xs">
          삭제된 강의룸은 복구할 수 없습니다.
        </p>
        <button
          onClick={() => onIsOpenChange(false)}
          className="px-3 py-1.5 text-xs text-text-dim border border-border rounded hover:bg-bg-hover"
        >
          취소
        </button>
        <button
          onClick={onConfirm}
          className="px-3 py-1.5 text-xs text-white bg-red-500 rounded hover:bg-red-400"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
