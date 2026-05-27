import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useChatStore } from '@/stores/chatStore';
import type { ChatBroadcast, ChatSendPayload } from '@/types/chat';

/**
 * STOMP WebSocket 연결을 관리하고 채팅 메시지 송수신을 처리하는 훅
 *
 * native WebSocket 사용
 * HttpOnly 쿠키로 인증 처리
 *
 * @param roomId - 연결할 강의룸의 ID
 * @returns sendMessage 함수 (채팅 메시지 전송용)
 */
export const useChatSocket = (roomId: number) => {
  const clientRef = useRef<Client | null>(null);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const setConnected = useChatStore((s) => s.setConnected);

  useEffect(() => {
    console.log('[ChatSocket] roomId:', roomId, 'WS_URL:', import.meta.env.VITE_WS_URL);

    const client = new Client({
      brokerURL: import.meta.env.VITE_WS_URL.replace(/^http/, 'ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/room/${roomId}/chat`, (frame) => {
          const payload: ChatBroadcast = JSON.parse(frame.body);
          appendMessage({
            messageId: payload.messageId,
            userId: payload.userId,
            nickname: payload.nickname,
            content: payload.content,
            createdAt: payload.createdAt,
            role: payload.role,
          });
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error('[STOMP Error]', frame);
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
    };
  }, [roomId, appendMessage, setConnected]);

  /**
   * STOMP를 통해 메시지를 서버로 전송하는 함수
   * @param content - 전송할 메시지 내용
   */
  const sendMessage = (content: string) => {
    if (!clientRef.current?.connected) return;
    const payload: ChatSendPayload = { content };
    clientRef.current.publish({
      destination: `/app/room/${roomId}/chat`,
      body: JSON.stringify(payload),
    });
  };

  return { sendMessage };
};
