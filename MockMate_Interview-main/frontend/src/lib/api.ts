import type {
  AuthFormPayload,
  AuthPayload,
  FeedbackPayload,
  MatchRequest,
  MatchStatusResponse,
  RoomState
} from '../types';

// Hinglish: backend API URL change karna ho to `.env` ya `VITE_API_BASE_URL` yahin se control hota hai.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  login: (payload: AuthFormPayload) =>
    apiFetch<AuthPayload>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  signup: (payload: AuthFormPayload) =>
    apiFetch<AuthPayload>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};

export const matchApi = {
  enqueue: (payload: MatchRequest, token: string) =>
    apiFetch<MatchStatusResponse>('/api/matchmaking/enqueue', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token),
  cancel: (token: string) =>
    apiFetch<MatchStatusResponse>('/api/matchmaking/cancel', {
      method: 'POST',
      body: JSON.stringify({})
    }, token),
  status: (token: string) =>
    apiFetch<MatchStatusResponse>('/api/matchmaking/status', {}, token)
};

export const roomApi = {
  active: (token: string) => apiFetch<RoomState>('/api/rooms/active/me', {}, token),
  byId: (roomId: string, token: string) => apiFetch<RoomState>(`/api/rooms/${roomId}`, {}, token)
};

export const feedbackApi = {
  submit: (payload: FeedbackPayload, token: string) =>
    apiFetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token)
};
