import type { EmojiReactionBroadcast, EmojiReactionPayload } from "@/types/emojiReaction";
import { Client } from "@stomp/stompjs";
import { useEffect, useRef } from "react";

interface UseReactionSocketOptions {
    // 연결할 강의룸 ID
    roomId: number;
    // 브로드캐스트 수신 시 호출되는 콜백
    onReceive: (broadcast: EmojiReactionBroadcast) => void;
}

/**
 * 이모지 리액션 WebSocket 연결을 관리하고 브로드캐스트 송수신을 처리하는 훅
 * 
 * native WebSocket 사용
 * HttpOnlu 쿠키로 인증 처리
 * 
 * @param roomId - 연결할 강의룸의 ID
 * @param onReceive = 브로드캐스트 수신 콜백
 * @returns {@link sendReaction} 이모지 전송 함수
 */
export const useReactionSocket = ({roomId, onReceive}: UseReactionSocketOptions) => {
    const clientRef = useRef<Client | null>(null);

    useEffect(()=> {
        const client = new Client({
            brokerURL: import.meta.env.VITE_WS_URL.replace(/^http/, 'ws'),
            reconnectDelay: 3000,
            onConnect: ()=> {
                client.subscribe(`/topic/room/${roomId}/reaction`,(frame) => {
                    const broadcast: EmojiReactionBroadcast = JSON.parse(frame.body);
                    if(broadcast.type === 'EMOJI') {
                        onReceive(broadcast);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('[STOMP REACTION ERROR]', frame);
            },
        });

        client.activate();
        clientRef.current = client;

        return ()=> {
            client.deactivate();
        };
    },[roomId]);

    /**
     * STOMP를 통해 이모지 리액션을 서버로 전송하는 함수
     * @param emoji  전송할 이모지 문자열
     */
    const sendReaction = (emoji: string) => {
        if(!clientRef.current?.connected) return;
        const payload: EmojiReactionPayload = {emoji};
        clientRef.current.publish({
            destination: `/app/room/${roomId}/reaction`,
            body: JSON.stringify(payload),
        });
    };

    return {sendReaction};
}