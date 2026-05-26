/**
 * 이해도 반응 이벤트 리퀘스트 페이로드
 */
export interface UnderstandingReactionRequest {
  /** 이벤트 유형 */
  type: 'OPEN' | 'CLOSE' | 'RESET' | 'VOTE';
  /**
   * 투표 종류
   * VOTE 일 때만 사용. null 이면 투표 취소
   */
  reaction?: 'understand' | 'confused' | null;
}

/**
 * 이해도 반응 이벤트 브로드캐스트 페이로드
 */
export interface UnderstandingReactionBroadcast {
  /**
   * 브로드캐스트 유형
   */
  type: 'UNDERSTANDING';
  /**
   * 세션 활성화 여부
   */
  isOpen: boolean;
  /**
   * 현재 투표 집계
   */
  counts: { understand: number; confused: number };
  /**
   * 세션 종료 시각
   */
  closedAt: number | null;
}
