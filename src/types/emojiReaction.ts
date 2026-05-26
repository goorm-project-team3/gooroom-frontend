// STOMP /app/room/{roomId}/reaction 으로 전송하는 페이로드
export interface EmojiReactionType {
    // 전송할 이모지 문자열
    emoji: string;
}

// STOMP /topic/room/{roomId}/reaction 에서 수신하는 브로드캐스트 페이로드
export interface EmojiReactionBroadcast {
    // 이벤트 타입
    type: 'EMOJI';

    // 사용자 ID
    userId: number;

    // 사용자 닉네임
    nickname: string;

    // 이모지 문자열
    emoji: string;
}