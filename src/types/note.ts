export interface SharedNoteResponse {
  id: number | null;
  content: string;
  updatedBy: {
    id: number;
    nickname: string;
  } | null;
  updatedAt: string | null;
}

export interface PersonalNoteResponse {
  id: number | null;
  content: string;
  updatedAt: string | null;
}
