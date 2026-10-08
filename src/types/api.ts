export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  timezone: string;
  role: "admin" | "user";
  is_verified: boolean;
  email_preferences: Record<string, unknown>;
  created_at: string;
}

export interface Notebook {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  notebook_id: string | null;
  user_id: string;
  title: string;
  content: Record<string, unknown>;
  plain_text: string;
  is_pinned: boolean;
  is_archived: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

export interface NoteVersion {
  id: string;
  note_id: string;
  content: Record<string, unknown>;
  plain_text: string;
  created_by: string | null;
  created_at: string;
}
