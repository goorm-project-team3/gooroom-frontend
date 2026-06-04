import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import type {
  UnderstandingReactionBroadcast,
  UnderstandingReactionRequest,
} from '@/types/understandingReaction';

interface UseUnderstandingReactionSocketOptions {
  /** 연결할 강의룸 ID */
  roomId: number;
  /** 브로드캐스트 수신 시 호출되는 콜백 */
  onReceive: (broadcast: UnderstandingReactionBroadcast) => void;
}

/**
 * 이해도 반응 WebSocket 연결을 관리하고 이벤트 송수신을 처리하는 훅
 *
 * native WebSocket 사용, HttpOnly 쿠키로 인증 처리
 *
 * @param roomId    연결할 강의룸의 ID
 * @param onReceive 브로드캐스트 수신 콜백
 * @returns {@link send} 이해도 반응 이벤트 전송 함수
 */
export const useUnderstandingReactionSocket = ({
  roomId,
  onReceive,
}: UseUnderstandingReactionSocketOptions) => {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: import.meta.env.VITE_WS_URL.replace(/^http/, 'ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/room/${roomId}/understanding-reaction`, (frame) => {
          const broadcast: UnderstandingReactionBroadcast = JSON.parse(frame.body);
          if (broadcast.type === 'UNDERSTANDING_STATE') {
            onReceive(broadcast);
          }
        });
      },
      onStompError: (frame) => {
        console.error('[STOMP UnderstandingReaction Error]', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [roomId, onReceive]);

  /**
   * STOMP를 통해 이해도 반응 이벤트를 서버로 전송하는 함수
   *
   * @param request 이벤트 타입과 투표 정보를 담은 요청 객체
   */
  const send = (request: UnderstandingReactionRequest) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/app/room/${roomId}/understanding-reaction`,
      body: JSON.stringify(request),
    });
  };

  return { send };
};
