"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  useAppStore,
  type MessageData,
  type PartData,
  type SessionStatus,
} from "../lib/store";
import { client } from "../lib/api";

const POLL_INTERVAL = 5_000;

function mapStatusToSessionStatus(status: { type: string }): SessionStatus {
  switch (status.type) {
    case "busy":
      return "busy";
    case "idle":
      return "idle";
    case "retry":
      return "retry";
    default:
      return "idle";
  }
}

export function useSessionStream() {
  const {
    addSession,
    updateSession,
    removeSession,
    addMessage,
    addPartToMessage,
    updatePartInMessage,
    updateMessage,
    setStatus,
    setSessions,
    setConnected,
    setError,
  } = useAppStore();

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSessionMessages = useCallback(
    async (sessionId: string) => {
      try {
        const messages = await client.session.messages(sessionId);
        if (!Array.isArray(messages) || messages.length === 0) return;
        for (const msg of messages) {
          addMessage(sessionId, {
            id: msg.info?.id || `msg-${Date.now()}`,
            role: msg.info?.role || "assistant",
            agent: msg.info?.agent,
            parts: (msg.parts || []).map((p: PartData) => ({
              id: p.id,
              type: p.type,
              text: p.text,
              tool: p.tool,
              status: p.status,
              output: p.output,
              title: p.title,
            })),
            tokens: msg.info?.tokens,
            cost: msg.info?.cost,
            createdAt: msg.info?.time?.created ?? Date.now(),
            completedAt: msg.info?.time?.completed,
          });
        }
        const lastMsg = messages[messages.length - 1];
        if (
          lastMsg.info?.role === "assistant" &&
          !lastMsg.info?.error &&
          lastMsg.info?.time?.completed
        )
          setStatus(sessionId, "done");
        else if (lastMsg.info?.error) setStatus(sessionId, "error");
        const userMsg = messages.find(
          (m: { info?: { role?: string; agent?: string } }) =>
            m.info?.role === "user" && m.info?.agent,
        );
        if (userMsg?.info?.agent)
          updateSession(sessionId, { agentName: userMsg.info.agent });
        const am = messages.findLast(
          (m: {
            info?: { role?: string; providerID?: string; modelID?: string };
          }) => m.info?.role === "assistant" && m.info?.providerID,
        );
        if (am?.info)
          updateSession(sessionId, {
            model: `${am.info.providerID}/${am.info.modelID}`,
            providerID: am.info.providerID,
          });
      } catch {}
    },
    [addMessage, setStatus, updateSession],
  );

  const refresh = useCallback(async () => {
    try {
      const sessions = await client.session.list();
      if (!Array.isArray(sessions)) return;
      setConnected(true);
      setError(null);
      const store = useAppStore.getState();
      const existingIds = new Set(Array.from(store.sessions.keys()));
      for (const s of sessions) {
        if (!existingIds.has(s.id)) {
          addSession({
            sessionId: s.id,
            parentID: s.parentID,
            agentName: s.agent,
            title: s.title || `Session ${s.id.slice(0, 8)}`,
            projectId: s.projectID || "",
            directory: s.directory || "",
            status: "idle" as SessionStatus,
            messages: [],
            isExpanded: true,
            isPinned: false,
            tokens: { input: 0, output: 0, reasoning: 0 },
            cost: 0,
            createdAt: s.time?.created || Date.now(),
          });
          fetchSessionMessages(s.id);
        }
      }
    } catch {
      if (useAppStore.getState().isConnected) setConnected(false);
    }
  }, [addSession, setConnected, setError, fetchSessionMessages]);

  const fetchInitialData = useCallback(async () => {
    try {
      const sessions = await client.session.list();
      if (!Array.isArray(sessions)) return;

      setConnected(true);
      setError(null);

      const cards = sessions.map(
        (s: {
          id: string;
          title?: string;
          agent?: string;
          parentID?: string;
          projectID?: string;
          directory?: string;
          time?: { created: number };
        }) => ({
          sessionId: s.id,
          parentID: s.parentID,
          title: s.title || `Session ${s.id.slice(0, 8)}`,
          agentName: s.agent || "unknown",
          projectId: s.projectID || "",
          directory: s.directory || "",
          status: "idle" as SessionStatus,
          messages: [],
          isExpanded: true,
          isPinned: false,
          tokens: { input: 0, output: 0, reasoning: 0 },
          cost: 0,
          createdAt: s.time?.created || Date.now(),
        }),
      );

      setSessions(cards);

      // Fetch messages for each session
      for (const card of cards) {
        try {
          const messages = await client.session.messages(card.sessionId);
          if (!Array.isArray(messages)) continue;

          for (const msg of messages) {
            const messageData: MessageData = {
              id: msg.info?.id || `msg-${Date.now()}`,
              role: msg.info?.role || "assistant",
              agent: msg.info?.agent,
              parts: (msg.parts || []).map((p: PartData) => ({
                id: p.id,
                type: p.type,
                text: p.text,
                tool: p.tool,
                status: p.status,
                output: p.output,
                title: p.title,
              })),
              tokens: msg.info?.tokens,
              cost: msg.info?.cost,
              createdAt: msg.info?.time?.created ?? Date.now(),
              completedAt: msg.info?.time?.completed,
            };
            addMessage(card.sessionId, messageData);
          }

          // Determine status, agent name, and model from messages
          if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (
              lastMsg.info?.role === "assistant" &&
              !lastMsg.info?.error &&
              lastMsg.info?.time?.completed
            ) {
              setStatus(card.sessionId, "done");
            } else if (lastMsg.info?.error) {
              setStatus(card.sessionId, "error");
            }

            // Extract agent name from the first user message that has one
            const userMsg = messages.find(
              (m: { info?: { role?: string; agent?: string } }) =>
                m.info?.role === "user" && m.info?.agent,
            );
            if (userMsg?.info?.agent) {
              updateSession(card.sessionId, { agentName: userMsg.info.agent });
            }

            // Extract model from the last assistant message
            const assistantMsg = messages.findLast(
              (m: {
                info?: { role?: string; providerID?: string; modelID?: string };
              }) => m.info?.role === "assistant" && m.info?.providerID,
            );
            if (assistantMsg?.info) {
              const modelStr = `${assistantMsg.info.providerID}/${assistantMsg.info.modelID}`;
              updateSession(card.sessionId, {
                model: modelStr,
                providerID: assistantMsg.info.providerID,
              });
            }
          }
        } catch {
          // Session might not have messages
        }
      }
    } catch (err) {
      console.error("Failed to connect to opencode server:", err);
      setConnected(false);
      setError("Cannot reach opencode server at localhost:4096");
    }
  }, [addMessage, setSessions, setConnected, setError, setStatus]);

  const startSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const es = new EventSource("/api/events");
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnected(true);
        setError(null);
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleEvent(data);
        } catch {
          // Ignore parse errors
        }
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        eventSourceRef.current = null;
        setTimeout(() => {
          if (!eventSourceRef.current) startPolling();
        }, 1000);
      };
    } catch {
      startPolling();
    }
  }, [setConnected, setError]);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    // Run first poll immediately
    (async () => {
      try {
        const sessions = await client.session.list();
        if (!Array.isArray(sessions)) return;
        setConnected(true);
        setError(null);
        const store = useAppStore.getState();
        const existingIds = new Set(Array.from(store.sessions.keys()));
        for (const s of sessions) {
          if (!existingIds.has(s.id)) {
            addSession({
              sessionId: s.id, parentID: s.parentID,
              title: s.title || `Session ${s.id.slice(0, 8)}`,
              agentName: s.agent || "unknown",
              projectId: s.projectID || "", directory: s.directory || "",
              status: "idle" as SessionStatus, messages: [], isExpanded: true, isPinned: false,
              tokens: { input: 0, output: 0, reasoning: 0 }, cost: 0,
              createdAt: s.time?.created || Date.now(),
            });
            fetchSessionMessages(s.id);
          }
        }
      } catch {}
    })();

    pollRef.current = setInterval(async () => {
      try {
        const sessions = await client.session.list();
        if (!Array.isArray(sessions)) return;

        setConnected(true);
        setError(null);

        const store = useAppStore.getState();
        const existingIds = new Set(Array.from(store.sessions.keys()));
        const fetchedIds = new Set(sessions.map((s: { id: string }) => s.id));

        for (const s of sessions) {
          if (!existingIds.has(s.id)) {
            addSession({
              sessionId: s.id,
              parentID: s.parentID,
              title: s.title || `Session ${s.id.slice(0, 8)}`,
              agentName: s.agent,
              projectId: s.projectID || "",
              directory: s.directory || "",
              status: "idle" as SessionStatus,
              messages: [],
              isExpanded: true,
              isPinned: false,
              tokens: { input: 0, output: 0, reasoning: 0 },
              cost: 0,
              createdAt: s.time?.created || Date.now(),
            });
            fetchSessionMessages(s.id);
          }
        }

        for (const id of existingIds) {
          if (!fetchedIds.has(id)) {
            removeSession(id);
          }
        }
      } catch {
        const store = useAppStore.getState();
        if (store.isConnected) setConnected(false);
        if (!store.error) setError("Cannot reach opencode server");
      }
    }, POLL_INTERVAL);
  }, [
    addSession,
    updateSession,
    removeSession,
    setConnected,
    setError,
    fetchSessionMessages,
  ]);

  const handleEvent = useCallback(
    (event: Record<string, unknown>) => {
      const type = event.type as string;
      const props = event.properties as Record<string, unknown> | undefined;

      if (!type || !props) return;

      switch (type) {
        case "session.created": {
          const info = props.info as
            | {
                id: string;
                parentID?: string;
                title?: string;
                agent?: string;
                projectID?: string;
                directory?: string;
                time?: { created: number };
              }
            | undefined;
          if (info) {
            addSession({
              sessionId: info.id,
              parentID: (info as { parentID?: string }).parentID,
              title: info.title || `Session ${info.id.slice(0, 8)}`,
              agentName: info.agent || "unknown",
              projectId: info.projectID || "",
              directory: info.directory || "",
              status: "idle",
              messages: [],
              isExpanded: true,
              isPinned: false,
              tokens: { input: 0, output: 0, reasoning: 0 },
              cost: 0,
              createdAt: info.time?.created || Date.now(),
            });
            fetchSessionMessages(info.id);
          }
          break;
        }

        case "session.deleted": {
          const info = props.info as { id: string } | undefined;
          if (info) {
            removeSession(info.id);
          }
          break;
        }

        case "session.updated": {
          const info = props.info as { id: string; title?: string } | undefined;
          if (info) {
            const existing = useAppStore.getState().sessions.get(info.id);
            const isFallbackName =
              existing && /^(Session |Unnamed)/.test(existing.agentName);
            if (isFallbackName || !existing) {
              updateSession(info.id, { agentName: info.title });
            }
          }
          break;
        }

        case "session.status": {
          const sessionId = props.sessionID as string;
          const status = props.status as { type: string } | undefined;
          if (sessionId && status) {
            setStatus(sessionId, mapStatusToSessionStatus(status));
          }
          break;
        }

        case "message.updated": {
          const msgInfo = props.info as
            | {
                id: string;
                sessionID: string;
                role: string;
                time?: { created: number; completed?: number };
                error?: unknown;
                tokens?: { input: number; output: number; reasoning: number };
                cost?: number;
              }
            | undefined;
          if (msgInfo) {
            const existing = useAppStore
              .getState()
              .sessions.get(msgInfo.sessionID);
            if (existing?.messages.find((m) => m.id === msgInfo.id)) {
              updateMessage(msgInfo.sessionID, msgInfo.id, {
                role: msgInfo.role as "user" | "assistant",
                tokens: msgInfo.tokens,
                cost: msgInfo.cost,
                completedAt: msgInfo.time?.completed,
                error: msgInfo.error ? "error" : undefined,
              });
            } else {
              addMessage(msgInfo.sessionID, {
                id: msgInfo.id,
                role: msgInfo.role as "user" | "assistant",
                parts: [],
                tokens: msgInfo.tokens,
                cost: msgInfo.cost,
                createdAt: msgInfo.time?.created ?? Date.now(),
                completedAt: msgInfo.time?.completed,
                error: msgInfo.error ? "error" : undefined,
              });
            }
          }
          break;
        }

        case "message.part.updated": {
          const part = props.part as
            | {
                id: string;
                sessionID: string;
                messageID: string;
                type: string;
                text?: string;
                delta?: string;
              }
            | undefined;
          if (part) {
            const existing = useAppStore
              .getState()
              .sessions.get(part.sessionID);
            const existingPart = existing?.messages
              .flatMap((m) => m.parts)
              .find((p) => p.id === part.id);

            if (existingPart) {
              updatePartInMessage(part.sessionID, part.messageID, part.id, {
                text: part.delta
                  ? (existingPart.text || "") + part.delta
                  : part.text,
              });
            } else {
              // Handle delta without existing part
              const store = useAppStore.getState();
              const session = store.sessions.get(part.sessionID);
              if (!session?.messages.find((m) => m.id === part.messageID)) {
                addMessage(part.sessionID, {
                  id: part.messageID,
                  role: "assistant",
                  parts: [
                    {
                      id: part.id,
                      type: part.type,
                      text: part.text || part.delta || "",
                    },
                  ],
                  createdAt: Date.now(),
                });
              } else {
                addPartToMessage(part.sessionID, part.messageID, {
                  id: part.id,
                  type: part.type,
                  text: part.text || "",
                });
              }
            }
          }
          break;
        }

        case "session.error": {
          const sessionId = props.sessionID as string;
          if (sessionId) {
            setStatus(sessionId, "error");
          }
          break;
        }
      }
    },
    [
      addSession,
      removeSession,
      updateSession,
      addMessage,
      updateMessage,
      addPartToMessage,
      updatePartInMessage,
      setStatus,
      fetchSessionMessages,
    ],
  );

  // Initialize connection
  useEffect(() => {
    fetchInitialData();
    // Try SSE first
    startSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [fetchInitialData, startSSE, startPolling]);

  return { refresh };
}
