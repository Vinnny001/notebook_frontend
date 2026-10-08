import { useAuthStore } from "../store/auth";
import type { Notebook, Note, NoteVersion, Tag, TokenPair, User } from "../types/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const { accessToken, refreshToken, setTokens, clearTokens } = useAuthStore.getState();
  if (!options.skipAuth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status === 401 && refreshToken && !path.includes("/auth/refresh")) {
    const refreshed = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (refreshed.ok) {
      const tokens = (await refreshed.json()) as TokenPair;
      setTokens(tokens.access_token, tokens.refresh_token);
      headers.set("Authorization", `Bearer ${tokens.access_token}`);
      response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } else {
      clearTokens();
    }
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { detail?: unknown };
    throw new Error(JSON.stringify(body.detail ?? { code: "request_failed" }));
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<TokenPair>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }), skipAuth: true }),
  register: (email: string, password: string, name: string) =>
    request<TokenPair>("/auth/register", { method: "POST", body: JSON.stringify({ email, password, name }), skipAuth: true }),
  me: () => request<User>("/auth/me"),
  notebooks: () => request<Notebook[]>("/notebooks"),
  createNotebook: (name: string) => request<Notebook>("/notebooks", { method: "POST", body: JSON.stringify({ name }) }),
  notes: (params: URLSearchParams) => request<Note[]>(`/notes?${params.toString()}`),
  note: (id: string) => request<Note>(`/notes/${id}`),
  createNote: (payload: { notebook_id: string | null; title: string; content?: Record<string, unknown>; plain_text?: string }) =>
    request<Note>("/notes", { method: "POST", body: JSON.stringify(payload) }),
  updateNote: (id: string, payload: Partial<Pick<Note, "title" | "content" | "plain_text" | "is_pinned" | "is_archived" | "is_deleted">>) =>
    request<Note>(`/notes/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  tags: () => request<Tag[]>("/tags"),
  createTag: (name: string, color: string) => request<Tag>("/tags", { method: "POST", body: JSON.stringify({ name, color }) }),
  versions: (noteId: string) => request<NoteVersion[]>(`/notes/${noteId}/versions`)
};
