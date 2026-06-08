"use client";

import { create } from "zustand";

export type SessionStatus = "idle" | "busy" | "error" | "done" | "retry";

export interface AgentCardData {
  sessionId: string;
  agentName: string;
  projectId: string;
  directory: string;
  status: SessionStatus;
  messages: MessageData[];
  isExpanded: boolean;
  isPinned: boolean;
  model?: string;
  providerID?: string;
  tokens: {
    input: number;
    output: number;
    reasoning: number;
  };
  cost: number;
  createdAt: number;
}

export interface MessageData {
  id: string;
  role: "user" | "assistant";
  agent?: string;
  parts: PartData[];
  tokens?: {
    input: number;
    output: number;
    reasoning: number;
  };
  cost?: number;
  createdAt: number;
  completedAt?: number;
  error?: string;
}

export interface PartData {
  id: string;
  type: string;
  text?: string;
  tool?: string;
  status?: string;
  output?: string;
  title?: string;
}

export interface AgentOption {
  name: string;
  description?: string;
  mode: string;
}

export interface ModelOption {
  id: string;
  providerID: string;
  name: string;
}

interface AppState {
  sessions: Map<string, AgentCardData>;
  isConnected: boolean;
  filter: string;
  statusFilter: SessionStatus | "all";
  darkMode: boolean;
  agents: AgentOption[];
  models: ModelOption[];
  defaultModel: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSessions: (sessions: AgentCardData[]) => void;
  addSession: (session: AgentCardData) => void;
  updateSession: (sessionId: string, updates: Partial<AgentCardData>) => void;
  removeSession: (sessionId: string) => void;
  addMessage: (sessionId: string, message: MessageData) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<MessageData>) => void;
  addPartToMessage: (sessionId: string, messageId: string, part: PartData) => void;
  updatePartInMessage: (sessionId: string, messageId: string, partId: string, updates: Partial<PartData>) => void;
  setStatus: (sessionId: string, status: SessionStatus) => void;
  toggleExpand: (sessionId: string) => void;
  togglePin: (sessionId: string) => void;
  setConnected: (connected: boolean) => void;
  setFilter: (filter: string) => void;
  setStatusFilter: (status: SessionStatus | "all") => void;
  toggleDarkMode: () => void;
  setAgents: (agents: AgentOption[]) => void;
  setModels: (models: ModelOption[]) => void;
  setDefaultModel: (model: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sessions: new Map(),
  isConnected: false,
  filter: "",
  statusFilter: "all",
  darkMode: typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches,
  agents: [],
  models: [],
  defaultModel: null,
  isLoading: false,
  error: null,

  setSessions: (sessions) =>
    set((state) => {
      const map = new Map(state.sessions);
      for (const s of sessions) {
        if (!map.has(s.sessionId)) {
          map.set(s.sessionId, s);
        }
      }
      return { sessions: map };
    }),

  addSession: (session) =>
    set((state) => {
      const map = new Map(state.sessions);
      map.set(session.sessionId, session);
      return { sessions: map };
    }),

  updateSession: (sessionId, updates) =>
    set((state) => {
      const map = new Map(state.sessions);
      const existing = map.get(sessionId);
      if (existing) {
        map.set(sessionId, { ...existing, ...updates });
      }
      return { sessions: map };
    }),

  removeSession: (sessionId) =>
    set((state) => {
      const map = new Map(state.sessions);
      map.delete(sessionId);
      return { sessions: map };
    }),

  addMessage: (sessionId, message) =>
    set((state) => {
      const map = new Map(state.sessions);
      const session = map.get(sessionId);
      if (session) {
        const existing = session.messages.find((m) => m.id === message.id);
        if (!existing) {
          map.set(sessionId, {
            ...session,
            messages: [...session.messages, message],
          });
        }
      }
      return { sessions: map };
    }),

  updateMessage: (sessionId, messageId, updates) =>
    set((state) => {
      const map = new Map(state.sessions);
      const session = map.get(sessionId);
      if (session) {
        map.set(sessionId, {
          ...session,
          messages: session.messages.map((m) =>
            m.id === messageId ? { ...m, ...updates } : m
          ),
        });
      }
      return { sessions: map };
    }),

  addPartToMessage: (sessionId, messageId, part) =>
    set((state) => {
      const map = new Map(state.sessions);
      const session = map.get(sessionId);
      if (session) {
        map.set(sessionId, {
          ...session,
          messages: session.messages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  parts: [...m.parts.filter((p) => p.id !== part.id), part],
                }
              : m
          ),
        });
      }
      return { sessions: map };
    }),

  updatePartInMessage: (sessionId, messageId, partId, updates) =>
    set((state) => {
      const map = new Map(state.sessions);
      const session = map.get(sessionId);
      if (session) {
        map.set(sessionId, {
          ...session,
          messages: session.messages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  parts: m.parts.map((p) =>
                    p.id === partId ? { ...p, ...updates } : p
                  ),
                }
              : m
          ),
        });
      }
      return { sessions: map };
    }),

  setStatus: (sessionId, status) =>
    set((state) => {
      const map = new Map(state.sessions);
      const session = map.get(sessionId);
      if (session) {
        map.set(sessionId, { ...session, status });
      }
      return { sessions: map };
    }),

  toggleExpand: (sessionId) =>
    set((state) => {
      const map = new Map(state.sessions);
      const session = map.get(sessionId);
      if (session) {
        map.set(sessionId, { ...session, isExpanded: !session.isExpanded });
      }
      return { sessions: map };
    }),

  togglePin: (sessionId) =>
    set((state) => {
      const map = new Map(state.sessions);
      const session = map.get(sessionId);
      if (session) {
        map.set(sessionId, { ...session, isPinned: !session.isPinned });
      }
      return { sessions: map };
    }),

  setConnected: (connected) => set({ isConnected: connected }),
  setFilter: (filter) => set({ filter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setAgents: (agents) => set({ agents }),
  setModels: (models) => set({ models }),
  setDefaultModel: (defaultModel) => set({ defaultModel }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
