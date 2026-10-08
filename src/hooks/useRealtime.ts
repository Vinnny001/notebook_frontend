import { useEffect, useMemo, useState } from "react";

import { useAuthStore } from "../store/auth";

type ConnectionStatus = "offline" | "connecting" | "online" | "reconnecting";

interface RealtimeMessage {
  type: string;
  payload?: unknown;
  user_id?: string;
}

export function useRealtime(noteId: string | null, onMessage: (message: RealtimeMessage) => void) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [status, setStatus] = useState<ConnectionStatus>("offline");

  const wsUrl = useMemo(() => {
    if (!noteId || !accessToken) {
      return null;
    }
    const base = import.meta.env.VITE_WS_BASE_URL ?? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`;
    return `${base}/notes/${noteId}?token=${encodeURIComponent(accessToken)}`;
  }, [accessToken, noteId]);

  useEffect(() => {
    if (!wsUrl) {
      setStatus("offline");
      return;
    }

    setStatus((current) => (current === "offline" ? "connecting" : "reconnecting"));
    const socket = new WebSocket(wsUrl);
    socket.addEventListener("open", () => {
      setStatus("online");
      socket.send(JSON.stringify({ type: "presence:update", name: "You", color: "#0f766e" }));
    });
    socket.addEventListener("message", (event: MessageEvent<string>) => {
      const parsed = JSON.parse(event.data) as RealtimeMessage;
      onMessage(parsed);
    });
    socket.addEventListener("close", () => setStatus("offline"));
    socket.addEventListener("error", () => setStatus("offline"));

    return () => {
      socket.close();
    };
  }, [onMessage, wsUrl]);

  return status;
}
