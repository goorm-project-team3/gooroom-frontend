import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoomMember, RoomRole } from '@/types/room';

type ReactionType = 'understand' | 'confused';
interface ReactionCounts {
  understand: number;
  confused: number;
}

/**
 * 강의룸 전역 상태 인터페이스
 * 룸 정보, 이해도 반응, 로그인 유저 정보를 관리
 */
interface RoomStore {
  // 룸 정보
  roomId: string | null;
  roomName: string | null;
  role: RoomRole;
  members: RoomMember[];

  /**
   * 강의룸 입장 시 룸 ID, 유저 역할, 룸 이름을 상태에 저장
   * @param roomId 입장한 룸의 ID
   * @param role 유저의 역할
   * @param roomName 강의룸의 이름
   */
  setRoom: (roomId: string, role: RoomRole, roomName?: string) => void;

  /** 강의룸 퇴장 시 상태를 초기화 */
  clearRoom: () => void;

  // 이해도 반응
  isReactionOpen: boolean;
  reactionCounts: ReactionCounts;
  myReaction: ReactionType | null;
  reactionClosedAt: number | null;

  /** 이해도 반응 세션 시작 */
  openReaction: () => void;

  /** 이해도 반응 세션 종료 */
  closeReaction: () => void;

  /** 이해도 반응 초기화 */
  resetReaction: () => void;

  /** 이해도 반응 제출 */
  submitReaction: (reaction: ReactionType) => void;

  /**
   * WebSocket 수신 시 이해도 반응 상태 동기화
   * @param isOpen 활성화 여부
   * @param counts 현재 집계
   * @param closedAt 종료 시각
   */
  syncUnderstandingReaction: (
    isOpen: boolean,
    counts: { understand: number; confused: number },
    closedAt: number | null,
  ) => void;

  // 로그인 유저 정보
  myUserId: number | null;
  myNickname: string | null;

  /**
   * 로그인 시 유저 ID 저장
   * @param id 로그인한 유저의 ID
   */
  setMyUserId: (id: number) => void;

  /**
   * 로그인 시 유저의 닉네임 저장
   * @param nickname 로그인한 유저의 닉네임
   */
  setMyNickname: (nickname: string) => void;

  /** 로그아웃 시 상태를 초기화 */
  clearUser: () => void;
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set) => ({
      roomId: null,
      roomName: null,
      role: 'USER',
      members: [],
      setRoom: (roomId, role, roomName) => set({ roomId, role, roomName: roomName ?? null }),
      clearRoom: () => set({ roomId: null, role: 'USER', members: [] }),
      clearUser: () => set({ myUserId: null, myNickname: null }),
      isReactionOpen: false,
      reactionCounts: { understand: 0, confused: 0 },
      myReaction: null,
      openReaction: () => set({ isReactionOpen: true, reactionClosedAt: null }),
      closeReaction: () => set({ isReactionOpen: false, reactionClosedAt: Date.now() }),
      resetReaction: () =>
        set({
          reactionCounts: { understand: 0, confused: 0 },
          myReaction: null,
          reactionClosedAt: null,
        }),
      submitReaction: (reaction) =>
        set((state) => {
          const prev = state.myReaction;
          const counts = { ...state.reactionCounts };
          if (prev) counts[prev] = Math.max(0, counts[prev] - 1);
          if (prev === reaction) return { reactionCounts: counts, myReaction: null };
          counts[reaction] += 1;
          return { reactionCounts: counts, myReaction: reaction };
        }),
      reactionClosedAt: null,
      myUserId: null,
      setMyUserId: (id) => set({ myUserId: id }),
      myNickname: null,
      setMyNickname: (nickname) => set({ myNickname: nickname }),
      syncUnderstandingReaction: (isOpen, counts, closedAt) =>
        set((state) => ({
          isReactionOpen: isOpen,
          reactionCounts: counts,
          reactionClosedAt: closedAt,
          myReaction: counts.understand === 0 && counts.confused === 0 ? null : state.myReaction,
        })),
    }),
    {
      name: 'gooroom-user', // localStorage 키 이름
      partialize: (state) => ({
        myUserId: state.myUserId,
        myNickname: state.myNickname,
        roomId: state.roomId,
        role: state.role,
        roomName: state.roomName,
      }),
    },
  ),
);
